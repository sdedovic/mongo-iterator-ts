import { Cursor } from "mongodb";
import { VError } from 'verror';

export interface IteratorMetrics {
    documentsSeen: number;
    documentsProcessed: number;
    batchesSeen: number;
    batchesProcessed: number;
}

export class MongoIterator<T> {
    private isPaused: boolean = false;

    private metrics = {
        documentsSeen: 0,
        documentsProcessed: 0,
        batchesSeen: 0,
        batchesProcessed: 0,
    };

    constructor(private readonly cursor: Cursor<T>,
                private readonly fn: (batch: T[]) => Promise<void>) {}

    /**
     * Starts the iterator if it's not running otherwise no-ops.
     */
    async run(): Promise<void> {
        while (!this.cursor.isClosed() && await this.cursor.hasNext() && !this.isPaused) {
            const batch: T[] = [];
            for (let i = 0; i < (this.cursor as any).cmd.batchSize; i++){
                // less entries in a batch than the batchSize, exit early
                if (!(await this.cursor.hasNext())) break;

                const document = await this.cursor.next();
                batch.push(document);
            }
            const documentsInBatch = batch.length;
            this.metrics.documentsSeen += documentsInBatch;
            this.metrics.batchesSeen += 1;

            try {
                await this.fn(batch);
            } catch (err) {
                throw new VError(err, "Error thrown while processing a batch!")
            }

            this.metrics.documentsProcessed += documentsInBatch;
            this.metrics.batchesProcessed += 1;
        }
        return;
    }

    /**
     * @deprecated - not sure if it works as expected
     * Stops processing data in the cursor after finishing the current batch. This method returns immediately.
     */
    pause(): void {
        if (!this.isPaused)
            this.isPaused = true;
    }

    /**
     * @deprecated - not sure if it works as expected
     */
    resume(): void {
        if (this.isPaused)
            this.isPaused = false;
    }

    getIsPaused(): boolean {
        return this.isPaused;
    }

    getMetrics(): IteratorMetrics {
        return this.metrics;
    }
}
