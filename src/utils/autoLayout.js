

export function autoLayout(nodes, edges) {
    let startNode = null
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        if (node.type == 'startNode') {
            if (!startNode) {
                startNode = node
            } else {
                console.log('error: startNode need only one')
                return
            }
        }
    }
    if (!startNode) {
        console.log('error: startNode not found')
        return
    }

    let lineDict = {}
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i]
        let source = edge['source']
        lineDict[source] = [...lineDict[source] || [], edge]
    }

    let maxX = 0
    let y = 0

    let startNodeID = startNode['id']


    let locationDict = {}
    locationDict[startNodeID] = { 'x': maxX, 'y': y }
    let vars = { 'maxX': maxX }

    customLayoutSub(startNodeID, lineDict, vars, y, locationDict)

    let space = 50
    let widthMaxDict = {}
    let heightMaxDict = {}
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        let layoutPosition = locationDict[node['id']]

        widthMaxDict[layoutPosition.x] = Math.max(widthMaxDict[layoutPosition.x] || 0, node.width + space)
        heightMaxDict[layoutPosition.y] = Math.max(heightMaxDict[layoutPosition.y] || 0, node.height + space)
        node.position = { 'x': layoutPosition.x * 200, 'y': layoutPosition.y * 400 }
    }

    let xArray = [0]
    let widthSum = 0
    for (let i = 0; i < Object.keys(widthMaxDict).length; i++) {
        let w = widthMaxDict[i]
        widthSum += w
        xArray = [...xArray, widthSum]
    }
    let yArray = [0]
    let heightSum = 0
    for (let i = 0; i < Object.keys(heightMaxDict).length; i++) {
        let h = heightMaxDict[i]
        heightSum += h
        yArray = [...yArray, heightSum]
    }
    // console.log('------------------')
    // console.log(widthMaxDict)
    // console.log(heightMaxDict)
    // console.log(xArray)
    // console.log(yArray)
    // console.log('------------------')

    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        let layoutPosition = locationDict[node['id']]

        node.position = { 'x': xArray[layoutPosition.x], 'y': yArray[layoutPosition.y] }
        // node.positionAbsolute = {'x': layoutPosition.x*200, 'y': layoutPosition.y*2000}
        // node.x = layoutPosition.x*200
        // node.y = layoutPosition.y*2000
    }


    return [nodes, edges]

}

export function customLayoutSub(fromNodeID, lineDict, vars, y, locationDict) {
    let fromNodeLines = lineDict[fromNodeID]
    if (!fromNodeLines) {
        return
    }
    for (let i = 0; i < fromNodeLines.length; i++) {
        let line = fromNodeLines[i]
        let lineSourceHandle = line['sourceHandle']
        if (lineSourceHandle == 'handleOut') {
            let lineTarget = line['target']

            let maxX = vars['maxX']
            if (i != 0) {
                maxX += 1
            }

            vars['maxX'] = maxX
            locationDict[lineTarget] = { 'x': maxX, 'y': y + 1 }
            customLayoutSub(lineTarget, lineDict, vars, y + 1, locationDict)
        }
    }
    for (let i = 0; i < fromNodeLines.length; i++) {
        let line = fromNodeLines[i]
        let lineSourceHandle = line['sourceHandle']
        if (lineSourceHandle == 'handleN') {
            let lineTarget = line['target']

            let maxX = vars['maxX']
            maxX += 1
            vars['maxX'] = maxX

            locationDict[lineTarget] = { 'x': maxX, 'y': y }
            customLayoutSub(lineTarget, lineDict, vars, y, locationDict)
        }
    }
}