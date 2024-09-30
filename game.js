const crypto = require('crypto');

// Class for generating the game rules table
class MoveTable {
    constructor(moves) {
        this.moves = moves;
        this.numMoves = moves.length;
    }

    generateTable() {
        let table = `\t${this.moves.join('\t')}\n`;
        for (let i = 0; i < this.numMoves; i++) {
            table += `${this.moves[i]}\t`;
            for (let j = 0; j < this.numMoves; j++) {
                if (i === j) {
                    table += "Draw\t";
                } else if ((j > i && j - i <= this.numMoves / 2) || (i > j && i - j > this.numMoves / 2)) {
                    table += "Win\t";
                } else {
                    table += "Lose\t";
                }
            }
            table += "\n";
        }
        return table;
    }
}

// Class to determine who wins based on the rules
class RuleEngine {
    constructor(moves) {
        this.moves = moves;
        this.numMoves = moves.length;
    }

    determineWinner(playerMove, computerMove) {
        const playerIndex = this.moves.indexOf(playerMove);
        const computerIndex = this.moves.indexOf(computerMove);

        if (playerIndex === computerIndex) {
            return 'Draw';
        } else if ((computerIndex > playerIndex && computerIndex - playerIndex <= this.numMoves / 2) ||
                   (playerIndex > computerIndex && playerIndex - computerIndex > this.numMoves / 2)) {
            return 'Computer wins!';
        } else {
            return 'You win!';
        }
    }
}

// Class for generating secure key and HMAC
class HMACGenerator {
    generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    generateHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

// Main Game class
class Game {
    constructor(moves) {
        this.moves = moves;
        this.hmacGenerator = new HMACGenerator();
        this.ruleEngine = new RuleEngine(moves);
        this.key = null;
        this.computerMove = null;
    }

    start() {
        // Generate key and computer's move
        this.key = this.hmacGenerator.generateKey();
        this.computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];

        // Generate HMAC of the computer's move
        const hmac = this.hmacGenerator.generateHMAC(this.key, this.computerMove);
        console.log(`HMAC: ${hmac}`);

        this.showMenu();
    }

    showMenu() {
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');

        this.getUserMove();
    }

    getUserMove() {
        const stdin = process.stdin;
        stdin.setEncoding('utf-8');
        stdin.once('data', (input) => {
            input = input.trim();
            if (input === '0') {
                console.log('Exiting the game.');
                process.exit();
            } else if (input === '?') {
                const moveTable = new MoveTable(this.moves);
                console.log(moveTable.generateTable());
                this.showMenu();
            } else if (parseInt(input) >= 1 && parseInt(input) <= this.moves.length) {
                const userMove = this.moves[parseInt(input) - 1];
                console.log(`Your move: ${userMove}`);
                console.log(`Computer move: ${this.computerMove}`);
                console.log(this.ruleEngine.determineWinner(userMove, this.computerMove));
                console.log(`HMAC key: ${this.key}`);
                process.exit();
            } else {
                console.log('Invalid input. Please try again.');
                this.showMenu();
            }
        });
    }
}

// Main logic to parse command-line arguments
function main() {
    const args = process.argv.slice(2);

    // Check if the number of moves is an odd number and ≥ 3
    if (args.length < 3 || args.length % 2 === 0) {
        console.error('Error: You must pass an odd number (≥ 3) of non-repeating moves.');
        console.error('Example: node game.js rock paper scissors');
        process.exit(1);
    }

    // Ensure all moves are unique
    const uniqueMoves = new Set(args);
    if (uniqueMoves.size !== args.length) {
        console.error('Error: Moves must be non-repeating.');
        console.error('Example: node game.js rock paper scissors');
        process.exit(1);
    }

    // Start the game
    const game = new Game(args);
    game.start();
}

// Run the game
main();
