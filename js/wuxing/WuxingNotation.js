export class WuxingNotationMove {}

export class WuxingGameNotation {

    /** @type {string} */
    notationText = ""

    /** @type {Array<WUxingNotationMove>} */
    moves = []

    analyzeMove() {
        this.isValid = true
    }
}

export class WuxingNotationBuilder {

}