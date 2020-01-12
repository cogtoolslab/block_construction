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
            //console.log('number of attempts:', nAttempts);
            return candidateSequence;            
        }
    }
}

var generateStructureSequence = function (structureList) {
    shuffle(structureList);
    return(structureList);
}


var setupRandomTrialList = function (trialTemplates, conditions = ['mental', 'physical'], miniblock_size = 4) {

    conditions = generateConditionSequence(trialTemplates, conditions = ['mental', 'physical'], miniblock_size = 4);
    structures = generateStructureSequence(trialTemplates);

    trialList = [];
    for (i=0; i<trialTemplates.length; i++) {

        _.extend(trialTemplates[i], {
            condition: conditions[i],
            trialNum: i
        });

    }

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


// var structureList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]

// var trialList = generateTrialList(structureList);
// console.log(trialList);

var trialOrdering = function() {
    // UNIMPLEMENTED- CODE COPIED FROM GRAPHICAL CONVENTIONS

    if (!this.useAugmentedStimlist) { // NOT useAugmentedStimlist means old refgame version 1.0-1.2
        // split these 8 chairs up into 2 sets of 4, one of them will be repeated, the other will be control
        var shuffledObjs = _.shuffle(_.range(0,numObjs));
        var repeatedObjs = shuffledObjs.slice(0,setSize);
        var controlObjs = shuffledObjs.slice(setSize,setSize*2);
        var sampledSubsetRepeated = "N"; // null placeholder
        var sampledSubsetControl = "N"; // null placeholder   
      } else { // define repeatedObj on basis of hard subsetting within cluster into contexts
        // independent random sampling to decide whether to use subset "A" or subset "B" within each cluster
        var sampledSubsetRepeated = _.sample(["A","A"]);
        var sampledSubsetControl = _.sample(["B","B"]);    
        _r = _.filter(this.stimList, ({subset,basic}) => subset == sampledSubsetRepeated && basic == repeatedCat);
        var repeatedObjs = _.values(_.mapValues(_r, ({object}) => object));
        _c = _.filter(this.stimList, ({subset,basic}) => subset == sampledSubsetControl && basic == controlCat);
        var controlObjs = _.values(_.mapValues(_c, ({object}) => object));    
      }
    
      // define common trialInfo for each condition (omits: targetID, phase, repetition -- these are 
      // added iteratively)
      commonRepeatedTrialInfo = {'objectIDs': repeatedObjs,
                                'category': repeatedCat,
                                'subset': sampledSubsetRepeated,      
                                'pose': 35,
                                'condition':'repeated',
                                'repeatedColor':repeatedColor
                                }
    
      commonControlTrialInfo = {'objectIDs': controlObjs,
                                'category': controlCat,
                                'subset': sampledSubsetControl,      
                                'pose': 35,
                                'condition':'control',
                                'repeatedColor':repeatedColor
                                }
    
      // pre phase 
      var pre = _.shuffle(_.concat(_.map(repeatedObjs, curObj => {
                        return _.extend({}, commonRepeatedTrialInfo, {'phase':'pre','repetition':0, 'targetID': curObj});
                        }), 
                                   _.map(controlObjs, curObj => {
                        return _.extend({}, commonControlTrialInfo, {'phase':'pre','repetition':0, 'targetID': curObj});
                        })));
    
      // repeated phase
      var repeated = _.flatMap(_.range(1,this.numReps+1), curRep => {
                      return _.map(_.shuffle(repeatedObjs), curObj => {
                        return _.extend({}, commonRepeatedTrialInfo, {'phase':'repeated','repetition':curRep, 'targetID': curObj});
                      })
                     });
    
      // post phase
      var post = _.shuffle(_.concat(_.map(repeatedObjs, curObj => {
                        return _.extend({}, commonRepeatedTrialInfo, {'phase':'post','repetition':this.numReps+1, 'targetID': curObj});
                        }), 
                                   _.map(controlObjs, curObj => {
                        return _.extend({}, commonControlTrialInfo, {'phase':'post','repetition':1, 'targetID': curObj});
                        })));  
    
      // build session by concatenating pre, repeated, and post phases
      var session = _.concat(pre, repeated, post);
    
      // this is the design dictionary
      return session;
    
}

