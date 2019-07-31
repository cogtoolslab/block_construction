// Handles interaction between html elements and the experiment canvas

var nonWorldBodies = 3;

function donePressed(){
    console.log(engine.world);
}

function checkPressed(){
    startBlocks = Matter.Query.region(blocks.map(bl => bl.body), world.bodies[1].bounds)
    finishBlocks = Matter.Query.region(blocks.map(bl => bl.body), world.bodies[2].bounds)
    if (startBlocks === undefined){
        startBlocks = [];
    }
    if (finishBlocks === undefined){
        finishBlocks = [];
    }
    
    console.log("Start Bodies: ");
    console.log(startBlocks);
    console.log("End Bodies: ")
    console.log(finishBlocks);
    console.log(checkListConnected(startBlocks.map(bo => bo.id),finishBlocks.map(bo => bo.id)));
}

// NEED TO DEBUG- DOESN'T SAY CONNECTED IN SOME SCENARIOS (MULTIPLE BLOCKS OVERLAPPING TARGETS)


function makeAdjacencyList(){
    // creates adjacency list corresponding to touching blocks
    connections = engine.pairs.table;
    var adjList = {};
    for (var key in connections) {
        if (connections.hasOwnProperty(key)) { //iterates through touching blocks, which are stored by smallest body number first
            contact = connections[key];
            aid = contact.bodyA.id;
            bid = contact.bodyB.id;
            if (adjList[aid]) {
                adjList[aid].push(bid);
              } else {
                adjList[aid] = [bid];
              }
              if (adjList[bid]) {
                adjList[bid].push(aid);
              } else {
                adjList[bid] = [aid];
              }
        }
      }
    //console.log(adjList);
    return adjList;
}

function checkListConnected(startBlocks, targetBlocks){
    if (startBlocks.length == 0 || targetBlocks.length == 0){
        return false
    } else {
        return(checkConnected(startBlocks[0], targetBlocks[0]));
        /*return (targetBlocks.forEach(start => {
            startBlocks.forEach(target => {
                checkConnected(start, target)
            })
        }))*/
    }
}

function checkConnected(start, target){
    

    adjList = makeAdjacencyList();
    // checks whether two blocks are connected using a Breadth First Search
    if (start == target){
        return true;
    }
    var q = [];
    var visited = {};
    
    q.push(start);
    visited[start] = true;

    while (q.length > 0) {
        b = q.shift();
        adjB = adjList[b];
        for (let i = 0; i < adjB.length; i++) {
            nextB = adjB[i];
            if(nextB != 2){
                if (nextB == target){
                    return true
                }
                if (!visited[nextB]){
                    q.push(nextB);
                    visited[nextB] = true;
                }
            }

        }
    }

    return false;
    
}

