const TelegramBot = require('node-telegram-bot-api');

// Bot tokeningizni bu yerda kiriting
const token = '6438247760:AAH2rgMS2Spsgou3TrKZJFLnFIbitI7x0Fw';

// Botni yaratish
const bot = new TelegramBot(token, { polling: true });

let games = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Tic-Tac-Toe o'yiniga xush kelibsiz. Shuni 👉🏻 /X0Xgame 👈🏻 Bosing");
});

bot.onText(/\/X0Xgame/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Qaysi darajani tanlaysiz:", {
        reply_markup: {
            keyboard: [['Oson', 'Qiyin']],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    // O'yinlarni hisoblash
    Object.values(games).forEach(game => {
        if (checkWinner(game.board) === 'X') {
            wins++;
        } else if (checkWinner(game.board) === 'O') {
            losses++;
        } else if (game.board.every(cell => cell !== null)) {
            draws++;
        }
    });

    const message = `Yutgan: ${wins}\nYutqazgan: ${losses}\nDurang: ${draws}`;

    // Chat ga yuborish
    bot.sendMessage(chatId, message);
});


bot.onText(/Oson|Qiyin/, (msg) => {
    const chatId = msg.chat.id;
    const difficulty = msg.text.toLowerCase() === 'oson' ? 'easy' : 'hard';
    games[chatId] = {
        board: Array(9).fill(null),
        difficulty: difficulty,
        currentPlayer: 'X'
    };

    bot.sendMessage(chatId, " ❕O'yin boshlandi❕ Siz X ", {
        reply_markup: generateBoard(games[chatId].board)
    });
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === 'Reply game') {
        bot.sendMessage(chatId, "Qaysi darajani tanlaysiz", {
            reply_markup: {
                keyboard: [['Oson', 'Qiyin']],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        return;
    }

    if (!games[chatId] || !/^[1-9]$/.test(text)) return;

    const position = parseInt(text) - 1;
    const game = games[chatId];

    if (game.board[position] !== null) {
        return;
    }

    game.board[position] = game.currentPlayer;
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';

    const winner = checkWinner(game.board);
    if (winner) {
        bot.sendMessage(chatId, `O'yin tugadi! G'olib: ${winner}`, {
            reply_markup: {
                keyboard: [['Reply game']],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        delete games[chatId];
    } else if (game.board.every(cell => cell !== null)) {
        bot.sendMessage(chatId, "O'yin tugadi! Durang!", {
            reply_markup: {
                keyboard: [['Reply game']],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        delete games[chatId];
    } else if (game.currentPlayer === 'O') {
        const botMove = getBotMove(game.board, game.difficulty);
        game.board[botMove] = 'O';
        game.currentPlayer = 'X';

        const winner = checkWinner(game.board);
        if (winner) {
            bot.sendMessage(chatId, `O'yin tugadi! G'olib: ${winner}`, {
                reply_markup: {
                    keyboard: [['Reply game']],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            delete games[chatId];
        } else if (game.board.every(cell => cell !== null)) {
            bot.sendMessage(chatId, "O'yin tugadi! Durang!", {
                reply_markup: {
                    keyboard: [['Reply game']],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            delete games[chatId];
        } else {
            bot.sendMessage(chatId, "Sizning navbatingiz!", {
                reply_markup: generateBoard(game.board)
            });
        }
    } else {
        bot.sendMessage(chatId, "Sizning navbatingiz!", {
            reply_markup: generateBoard(game.board)
        });
    }
});

function generateBoard(board) {
    return {
        inline_keyboard: [
            [
                { text: board[0] || '1', callback_data: '0' },
                { text: board[1] || '2', callback_data: '1' },
                { text: board[2] || '3', callback_data: '2' }
            ],
            [
                { text: board[3] || '4', callback_data: '3' },
                { text: board[4] || '5', callback_data: '4' },
                { text: board[5] || '6', callback_data: '5' }
            ],
            [
                { text: board[6] || '7', callback_data: '6' },
                { text: board[7] || '8', callback_data: '7' },
                { text: board[8] || '9', callback_data: '8' }
            ]
        ]
    };
}

bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;

    if (data === 'reply_game') {
        bot.sendMessage(chatId, "Qaysi darajani tanlaysiz:", {
            reply_markup: {
                keyboard: [['Oson', 'Qiyin']],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else {
        const position = parseInt(data);
        if (!games[chatId] || games[chatId].board[position] !== null) return;

        const game = games[chatId];
        game.board[position] = game.currentPlayer;
        game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';

        const winner = checkWinner(game.board);
        if (winner) {
            bot.sendMessage(chatId, `O'yin tugadi! G'olib: ${winner}`, {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Reply game', callback_data: 'reply_game' }]]
                }
            });
            delete games[chatId];
        } else if (game.board.every(cell => cell !== null)) {
            bot.sendMessage(chatId, "O'yin tugadi! Durang!", {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Reply game', callback_data: 'reply_game' }]]
                }
            });
            delete games[chatId];
        } else if (game.currentPlayer === 'O') {
            const botMove = getBotMove(game.board, game.difficulty);
            game.board[botMove] = 'O';
            game.currentPlayer = 'X';

            const winner = checkWinner(game.board);
            if (winner) {
                bot.sendMessage(chatId, `O'yin tugadi! G'olib: ${winner}`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'Reply game', callback_data: 'reply_game' }]]
                    }
                });
                delete games[chatId];
            } else if (game.board.every(cell => cell !== null)) {
                bot.sendMessage(chatId, "O'yin tugadi! Durang!", {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'Reply game', callback_data: 'reply_game' }]]
                    }
                });
                delete games[chatId];
            } else {
                bot.editMessageReplyMarkup(generateBoard(game.board), {
                    chat_id: chatId,
                    message_id: msg.message_id
                });
            }
        } else {
            bot.editMessageReplyMarkup(generateBoard(game.board), {
                chat_id: chatId,
                message_id: msg.message_id
            });
        }
    }
});

function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // gorizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertikal
        [0, 4, 8], [2, 4, 6] // diagonal
    ];
    for (let line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function getBotMove(board, difficulty) {
    const emptyPositions = board.map((cell, index) => cell === null ? index : null).filter(cell => cell !== null);

    if (difficulty === 'easy') {
        return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    } else {
        return getOptimalMove(board, 'O');
    }
}

function getOptimalMove(board, player) {
    const opponent = player === 'X' ? 'O' : 'X';
    const emptyPositions = board.map((cell, index) => cell === null ? index : null).filter(cell => cell !== null);

    let bestMove = -1
    let bestScore = -Infinity;

for (let position of emptyPositions) {
    board[position] = player;
    let score = minimax(board, false, player, opponent);
    board[position] = null;

    if (score > bestScore) {
        bestScore = score;
        bestMove = position;
    }
}

return bestMove;
}

function minimax(board, isMaximizing, player, opponent) {
    const winner = checkWinner(board);
    if (winner === player) return 1;
    if (winner === opponent) return -1;
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = player;
                let score = minimax(board, false, player, opponent);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = opponent;
                let score = minimax(board, true, player, opponent);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}
console.log("Bot is runing...");