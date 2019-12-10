import _ from 'lodash'

const removeItems = (arr, toremove) => {
    toremove = toremove || []

    for (let i of toremove) {
        let k = 0
        while (k < arr.length) {
            if (k < arr.length && arr[k] === i) {
                arr.splice(k, 1)
                break
            }
            k++
        }
    }

    return arr
}

//Decision Tree
class Node {
    constructor(parent = null, turn = 0, player, computer, choice = null, level, choiceHistory) {
        this._heap = 0
        this.maxLevel = this.level = level
        this.minLevel = 1000000
        this.parent = parent
        this.minmax = 0
        this.turn = turn
        this.nexts = []
        this.player = player
        this.computer = computer
        this.current = turn ? computer : player
        this.playerCards = player.cards
        this.computerCards = computer.cards
        this.choice = choice
        this.end = 0
        this.choiceHistory = choiceHistory
    }

    tryUpdate() {
        if (this.end === 1) {
            this.update(-1)
        } else if (!this.turn && !this.computerCards.length) {
            // console.log('Computer wins: ' + this.choiceHistory.map(c=>`[${c}]`).join('    '))
            this.update(0)
        } else if (this.turn && !this.playerCards.length) {
            // console.log('Player wins: ' + this.choiceHistory.map(c=>`[${c}]`).join('    '))
            this.update(1)
        }
    }

    add(node) {
        this.nexts.push(node)
        return node
    }

    //update player's minmax, if minmax is -1, then result is unknown
    update(value) {
        this.end = 1

        if (value === -1) {//force update, result is unknown
            let cur = this
            while (cur != null) {
                cur.minmax = -1
                cur = cur.parent
            }
        } else {
            this.minmax = value
            let cur = this.parent

            while (cur != null) {
                let res = cur.turn, maxLevel = cur.maxLevel, minLevel = cur.minLevel

                for (let next of cur.nexts) {
                    maxLevel = Math.max(maxLevel, next.maxLevel)
                    minLevel = Math.min(minLevel, next.minLevel)

                    if (next.minmax === -1) {
                        res = -1
                    }

                    res = cur.turn ? (res & next.minmax) : (res | next.minmax)
                }
                cur.maxLevel = maxLevel
                cur.minLevel = minLevel
                cur.minmax = cur.minmax === -1 ? cur.minmax : res
                cur = cur.parent
            }
        }
    }
}

const isPokerMatch = (sample, b) => {
    if (!sample || !sample.length) return true
    if (b && !b.length) return true

    let lens = sample.length, lenb = b.length
    let allSameS = new Set(sample).size === 1, allSameB = new Set(b).size === 1
    let firstMatch = b[0] > sample[0]

//16+17
    if (lenb === 2 && b[0] + b[1] === 33) return true

//bomb
    if (lenb === 4 && allSameB) {
        return !(lens === 4 && allSameS && !firstMatch)
    }

//1 or 2 or 3
    if (lens < 4) {
        return lenb === lens && firstMatch
    }

    if (lens === 4) {
        if (allSameS) {//4
            return lenb === 4 && allSameB && firstMatch
        } else {//3+1
            return lenb === 4 && !allSameB && firstMatch
        }
    }

//3+2
    if (lens === 5 && new Set(sample).size === 2) {
        return new Set(b).size === 2 && firstMatch
    }

//12345..
    return lenb === lens && firstMatch
}

class Player {
    constructor(cards = [], goFirst) {
        this.cards = cards
        this.goFirst = goFirst
        this.cards = this.cards.sort((a, b) => a - b)
    }

    choices(choice = null) {
        if (choice === null && !this.goFirst)
            return [[]]

        let consecs = [], ones = [], twos = [], threes = [],
            consec = [], sameCount = 1, kings = [], bombs = []

        const addToSec = () => {
            if (consec.length > 4) {
                for (let j = 0; j < consec.length - 4; j++)
                    for (let k = j + 5; k <= consec.length; k++)
                        consecs.push(_.slice(consec, j, k))
            }

            consec = []
        }

        for (let i = 0; i < this.cards.length; i++) {
            let cur = this.cards[i]
            let last = _.last(consec)

            ones.push([cur])

            if (last !== cur) {
                //end of previous consective cards
                if ((cur < 15 && cur !== last + 1) || cur === 15) addToSec()

                consec.push(cur)

                //kings
                if (cur === 17 && last === 16) kings.push([17, 16])
                sameCount = 1
            } else {
                sameCount++
                twos.push([cur, cur])
                if (sameCount === 3) threes.push([cur, cur, cur])
                if (sameCount === 4) bombs.push([cur, cur, cur, cur])
            }
        }

        addToSec()

        let threeOnes = [], threeTwos = []

        for (let i = 0; i < threes.length; i++) {
            for (let j = 0; j < this.cards.length; j++) {
                if (this.cards[j] != threes[i][0]) {
                    threeOnes.push(_.concat(threes[i], [this.cards[j]]))
                }
            }

            for (let j = 0; j < twos.length; j++) {
                if (twos[j][0] != threes[i][0]) {
                    threeTwos.push(_.concat(threes[i], twos[j]))
                }
            }
        }

        let all = [consecs, ones, twos, threes, kings, bombs, threeOnes, threeTwos]

        //no choice is a choice, but if you go first, you can not pass
        if (choice && choice.length)
            all.push([[]])

        return all.reduce((p, c) => _.concat(p, _.uniqBy(c, JSON.stringify)), [])
            .filter(isPokerMatch.bind(this, choice))
    }

    remove(choice) {
        removeItems(this.cards, choice)
    }

    update(choice) {
        // this.cards.splice(0)
        let j = 0
        for (let i of choice) {
            for (; j <= this.cards.length; j++) {
                if (j == this.cards.length || this.cards[j] > i) {
                    this.cards.splice(j, 0, i)
                    break
                }
            }
        }
    }
}

//   let a = '3 4 4 6 6 8 8 17'.split(' ').map(Number), b = '7 9 9'.split(' ').map(Number)
//   let root = new Node(null, 0, a, b)
let _HEAP = 0

const buildTree = (node = null, level, choiceHistory,MAXHEAP) => {
    _HEAP++
    if (node && _HEAP >= MAXHEAP) {
        node.minmax = -1
        node.end = 1
    }

    if (node && node.end) return
    let choices = node.current.choices(node.choice)

    for (let choice of choices) {
        let stashed = [...choice]
        node.current.remove(choice)
        choiceHistory.push(stashed)
        let child = node.add(new Node(node, 1 - node.turn, node.player, node.computer, stashed, level, choiceHistory))

        buildTree(child, level + 1, choiceHistory,MAXHEAP)
        child.tryUpdate()
        choiceHistory.pop()
        node.current.update(stashed)

        if (child.minmax === -1) {
            break
        }
    }
}

const buildRootFromStr = (astr, bstr, aGoFirst) => {
    let a = new Player(astr.split(',').map(Number), aGoFirst), b = new Player(bstr.split(',').map(Number), !aGoFirst)

    let root = new Node(null, 0, a, b, null, 0, [])

    buildTree(root, 0, [])

    return root
}

//build function from algo.js, except for that, all are the same
export function build(player, computer, playerFirst ,MAXHEAP) {
    let root = new Node(null, 0, new Player(player, playerFirst), new Player(computer, !playerFirst), null, 0, [])

    _HEAP = 0
    buildTree(root, 0, [],MAXHEAP)

    return root
}
