pragma solidity ^0.4.24;

contract MusicDAO {
    struct Note {
        // Step is the time to start the note
        uint8 step;
        // Duration is the end of the note
        uint8 duration;
        // Pitch is the pitch of the note A0 = 0 -> A8 = 96
        uint8 pitch;
    }

    mapping(uint => Note) private notes;
    uint private currentNote;
    mapping(uint => uint) private measures;
    mapping(uint => uint) public votes;
    mapping(address => bool) public authorizedVoters;
    mapping(address => uint) private nextVote;
    uint public currentMeasureID;
    uint[] private song;
    uint public currentMeasure;
    uint public songLength;
    uint public lengthRoundBlocks;
    uint private currentRoundStart;

    constructor(uint _songLength, uint _lengthRoundBlocks) public {
        currentMeasureID = 0;
        currentMeasure = 0;
        songLength = _songLength;
        lengthRoundBlocks = _lengthRoundBlocks;
    }

    function finalizeVoting() internal {
        uint bestMeasureId = 0;
        uint bestMeasureVotes = 0;
        for (uint i = 0; i < currentMeasureID; i++) {
            if (votes[i] > bestMeasureVotes) {
                bestMeasureVotes = votes[i];
                bestMeasureId = i;
            }
        }
        song[currentMeasure] = measures[bestMeasureId];
        currentMeasure++;
    }

    function vote(uint id) external {
        require(authorizedVoters[msg.sender], "sender is not authorized to vote (run claim())");
        require(nextVote[msg.sender] <= currentMeasure, "sender already voted");
        votes[id] += 1;
        nextVote[msg.sender] = currentMeasure + 1;
    }

    function claim() external {
        authorizedVoters[msg.sender] = true;
    }

    function byteToUint8(byte b) pure internal returns (uint8) {
        uint8 i;
        assembly {
            mstore8(i, b)
        }
        return i;
    }

    function propose(bytes m) external {
        require(authorizedVoters[msg.sender], "sender is not authorized to propose");
        uint measureStart = currentNote;
        for (uint i = 0; i < m.length; i += 3) {
            notes[currentNote] = Note(byteToUint8(m[i]), byteToUint8(m[i+1]), byteToUint8(m[i+2]));
            currentNote++;
        }
        // TODO: come up with serialization method for measures/notes.
        measures[currentMeasureID] = measureStart;
        votes[currentMeasureID] = 0;
        currentMeasureID++;
    }
}