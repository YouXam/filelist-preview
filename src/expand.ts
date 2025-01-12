export type Node = {
    type: 'folder'
    name: string
    children: Node[]
} | {
    type: 'file'
    name: string
}

type InternalNode = ({
    type: 'folder'
    name: string
    children: InternalNode[]
} | {
    type: 'file'
    name: string
}) & {
    count: number
    indent: number
}

export type Entry = {
    type: 'omit',
    indent: number
} | {
    type: 'file' | 'folder' | 'folderExpanded'
    name: string
    indent: number
}

const dfs: (nodes: Node[], indent?: number) => [number, InternalNode[]] = (nodes, indent = 1) =>
    nodes.reduce(([count, nodes], node) => {
        if (node.type === 'file') return [count + 1, [...nodes, { ...node, count: 1, indent }]]
        const [nodeCount, children] = dfs(node.children, indent + 1)
        return [count + nodeCount, [...nodes, { ...node, count: nodeCount, indent, children }]]
    }, [1, []] as [number, InternalNode[]])

function expandNode(node: InternalNode, expand: boolean): Entry {
    if (node.type === 'file') return { type: 'file', name: node.name, indent: node.indent }
    return { type: expand ? 'folderExpanded' : 'folder', name: node.name, indent: node.indent }
}

interface TypeWithName {
    name: string
    type: 'file' | 'folder'
}

function dictionarySort<T extends TypeWithName>(nodes: T[]): T[] {
    return [...nodes].sort((a, b) => {
        if (a.type === 'file' && b.type === 'folder') return 1
        if (a.type === 'folder' && b.type === 'file') return -1
        return a.name.localeCompare(b.name)
    })
}

function expandNodes(count: number, nodes: InternalNode[]): Entry[] {
    if (count == 0 || count == 1 && nodes.length > 1) return []
    else if (count === nodes.length) return dictionarySort(nodes).map(node => expandNode(node, false))
    else if (count < nodes.length) {
        return [
            ...dictionarySort(nodes).slice(0, count - 1).map(node => expandNode(node, false)),
            { type: 'omit', indent: nodes[0].indent }
        ]
    }
    const sorted = nodes.sort((a, b) => a.count - b.count)
    let rest = count;
    const result: (TypeWithName & { children: Entry[] })[] = []
    for (let i = 0; i < sorted.length; i++) {
        const node = sorted[i]
        const max = Math.floor(rest / (sorted.length - i))
        const sub = node.type === 'file' ? [] : expandNodes(max - 1, node.children)
        const entry = expandNode(node, sub.length > 0)
        result.push({
            name: node.name,
            type: node.type,
            children: [entry, ...sub]
        })
        rest -= 1 + sub.length
    }
    return dictionarySort(result).reduce((acc, node) => [...acc, ...node.children], [] as Entry[])
}

export function expand(count: number, nodes: Node[]): Entry[] {
    const [_, internalNodes] = dfs(nodes)
    return expandNodes(count, internalNodes)
}
