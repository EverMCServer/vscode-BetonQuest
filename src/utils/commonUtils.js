

export function connectionAvaliable(sourceType, sourceHandle, targetType, targetHandle) {
    if (sourceType == 'startNode' && sourceHandle == 'handleOut' && targetType == 'npcNode' && targetHandle == 'handleIn') {
        return true
    } else if (sourceType == 'npcNode' && sourceHandle == 'handleOut' && targetType == 'playerNode' && targetHandle == 'handleIn') {
        return true
    } else if (sourceType == 'playerNode' && sourceHandle == 'handleOut' && targetType == 'npcNode' && targetHandle == 'handleIn') {
        return true
    } else if (sourceType == 'npcNode' && sourceHandle == 'handleN' && targetType == 'npcNode' && targetHandle == 'handleIn') {
        return true
    }
    return false
}

export function logError(str) {
    console.log('Error:', str)
}

export function logWarning(str) {
    console.log('Warning:', str)
}

export function arrayAppend(arr, obj) {
    return [...arr || [], obj]
}

export function stringSplitToArray(text) {
    return text.split(',').map(item => item.trim()).filter(item => item.length > 0)
}