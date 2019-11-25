var generateConditionSequence = function (structureList, conditions = ['mental', 'physical'], miniblock_size = 4) {
    
    var numStims = structureList.length;
    
    var miniBlockTemplate = repeatArray(conditions, miniblock_size/(conditions.length));
    var num_miniblocks = numStims/miniblock_size;
    var nAttempts = 0;
    
    var found_good_sequence = false;
    while (!found_good_sequence){
        nAttempts ++;
        var candidateSequence = [];
        for (i = 0; i < num_miniblocks; i++) {
            shuffle(miniBlockTemplate)
            miniBlockTemplate.forEach(condition => {
                candidateSequence.push(condition);
            })
        }
        // test candidate sequence
        comsEqual = centerOfMass(candidateSequence, conditions[0]) == centerOfMass(candidateSequence, conditions[1]);
        
        if(!hasStreakOfLength(candidateSequence, 3) && comsEqual){
            found_good_sequence = true;
            console.log('number of attempts:', nAttempts);
            return candidateSequence;            
        }

    }

}

var generateStructureSequence = function (structureList) {
    shuffle(structureList);
    return(structureList);
}


var generateTrialList = function (structureList, conditions = ['mental', 'physical'], miniblock_size = 4) {

    conditions = generateConditionSequence(structureList, conditions = ['mental', 'physical'], miniblock_size = 4);
    structures = generateStructureSequence(structureList);

    trialList = {
        conditions: conditions,
        structures: structures
    }
    return trialList

}

var shuffle = function (listToShuffle) {
    listToShuffle.sort(function(a, b){return 0.5 - Math.random()});
}

var repeatArray = function(inputArray, ntimes) {
    var outputArray = [];
    for (i = 0; i < ntimes; i++){
        inputArray.forEach(e => {
            outputArray.push(e)
        })
    }
    return (outputArray)
}

var hasStreakOfLength = function(inputArray, streakTarget) {
    // Returns true if a streak greater than or equal to streakLength exists
    var longestRun = 0;
    var streakItem = inputArray[0];
    var streakLength = 1;
    var i = 1;
    while (i < inputArray.length && longestRun < streakTarget){
        nextItem = inputArray[i];
        if (streakItem == nextItem) {
            streakLength++;
            if (streakLength == streakTarget){
                return true;
            }
        } else {
            streakLength = 1;
            streakItem = nextItem
        }
        i++;
    }
    return false;
}

var centerOfMass = function (inputArray, e) {
    indices = inputArray.map((x, i) => x == e ? i : 0);
    com = indices.reduce(function(a,b){
        return a + b
      }, 0); //sum of indices
    return com;
}


var structureList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]

var trialList = generateTrialList(structureList);
console.log(trialList);