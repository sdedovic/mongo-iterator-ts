# Mongo Iterator
A small utility for efficiently iterating through MongoDb collections.

![](https://github.com/sdedovic/mongo-iterator-ts/workflows/Node.js%20Package/badge.svg)
![npm (tag)](https://img.shields.io/npm/v/mongo-iterator/latest)

```bash
npm i --save mongo-iterator
```

This library exposes a single class `MongoIterator`. The constructor takes a Mongo cursor and callback. The callback is executed with a batch of documents from the cursor. Conceptually it functions as a `forEach` loop.

Under the hood a `MongoIterator` object gathers a single bach from Mongo before invoking the callback. This means it avoids unecessary network requests. It is useful for iterating over large collections for ETL jobs or for updating documents en masse.

**This library is in a work in progress. Breaking changes are inbound. YMMV.**

## Dependencies
**Tested with:**
- Mongo 3.4.6
- NodeJs 12.x

## Usage
### Basic Example

```typescript
import { MongoClient } from "mongodb";
import { MongoIterator } from "./src";

async function main(): Promise<void> {
    const client = new MongoClient(...);
    await client.connect();
    const cursor = client
        .db('')
        .collection('')
        .find({})
        .sort({_id: 1})
        .batchSize(2000);

    const iterator = new MongoIterator(cursor, async batch => {
        // do something with the batch
    });

    await iterator.run();

    // log/inspect iterator.getMetrics();
}
```

## Documentation
Just read the code. It's short.

### TODO
- Publish to NPM with type defs
- Add unit tests to repo after I fix them
- Test/un-deprecate the `pause`/`resume` methods.
