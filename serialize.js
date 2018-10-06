const notes = {
    0: "a",
    1: "a#",
    2: "b",
    3: "c",
    4: "c#",
    5: "d",
    6: "d#",
    7: "e",
    8: "f",
    9: "f#",
    10: "g",
    11: "g#"
}

const values = {
    "a":  0,
    "a#": 1,
    "b":  2,
    "c":  3,
    "c#": 4,
    "d":  5,
    "d#": 6,
    "e":  7,
    "f":  8,
    "f#": 9,
    "g":  10,
    "g#": 11,
}

function deserialize(b) {
    let note = notes[b[2] % 12] + ("" + Math.floor(b[2] / 12))
    return [b[0], b[1], note]
}

function serialize(s) {
    let notes = s.split("\n")
    let measure = Buffer.from("")
    for (n of notes) {
        let components = n.split(" ")
        let note = components[2]
        let noteOctave = Number(note[note.length - 1]) * 12 + values[note.slice(0, note.length - 1)]
        let out = new Uint8Array([Number(components[0]), Number(components[1]), Number(noteOctave)]);
        measure = Buffer.concat([measure, new Buffer(out)])
    }
    return measure
}

console.log(deserialize(Buffer.from("01023f", "hex")));
console.log(serialize("1 2 c5"))