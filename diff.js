class DocumentDiffs {
    constructor() {
        this.documents = new Map();
    }

    update(document) {
        if (document === undefined) { return; }

        const fileName = document.fileName;
        if (this.documents.has(fileName)) {
            const startLength = this.documents.get(fileName).startLength;
            this.documents.set(fileName,
                new DocumentDiff(startLength, document.lineCount));
        } else {
            this.documents.set(fileName,
                new DocumentDiff(document.lineCount, document.lineCount));
        }
    }

    total() {
        let total = 0;
        this.documents.forEach((value) => {
            total += value.diff();
        });
        return total;
    }

    clear() {
        this.documents.clear();
    }
};
exports.DocumentDiffs = DocumentDiffs;

class DocumentDiff {
    constructor(startLength, endLength) {
        this.startLength = startLength;
        this.endLength = endLength;
    }

    diff() {
        return this.endLength - this.startLength;
    }
};