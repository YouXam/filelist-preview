import { expect, test } from 'vitest'
import { expand, type Node, type Entry } from '../src/expand'

test('expand 0 nodes should return empty array', () => {
    const nodes: Node[] = [{ type: 'file', name: 'index.ts' }]
    expect(expand(0, nodes)).toEqual([])
})

test('expand 1 node to 1 should return that node', () => {
    const nodes: Node[] = [{ type: 'file', name: 'index.ts' }]
    expect(expand(1, nodes)).toEqual([{ type: 'file', name: 'index.ts', indent: 1 }])
})

test('expand 2 nodes to 1 should return empty array', () => {
    const nodes: Node[] = [{ type: 'file', name: 'index.ts' }, { type: 'file', name: 'app.ts' }]
    expect(expand(1, nodes)).toEqual([])
})

test('expand 2 nodes to 2 should return 2 sorted nodes', () => {
    const nodes: Node[] = [{ type: 'file', name: 'index.ts' }, { type: 'file', name: 'app.ts' }]
    expect(expand(2, nodes)).toEqual([
        { type: 'file', name: 'app.ts', indent: 1 },
        { type: 'file', name: 'index.ts', indent: 1 },
    ])
})

test('expand 3 nodes to 2 should return 1 node and 1 omit', () => {
    const nodes: Node[] = [{ type: 'file', name: 'index.ts' }, { type: 'file', name: 'app.ts' }, { type: 'file', name: 'package.json' }]
    expect(expand(2, nodes)).toEqual([
        { type: 'file', name: 'app.ts', indent: 1 },
        { type: 'omit', indent: 1 },
    ])
})


test('expand folder', () => {
    const nodes: Node[] = [{ type: 'folder', name: 'src', children: [{ type: 'file', name: 'index.ts' }] }]
    expect(expand(2, nodes)).toEqual([
        { type: 'folderExpanded', name: 'src', indent: 1 },
        { type: 'file', name: 'index.ts', indent: 2 },
    ])
})

const tsproject : Node[] = [
    {
        type: 'folder',
        name: 'src',
        children: [
            {
                type: 'folder',
                name: 'components',
                children: [
                    { type: 'file', name: 'button.tsx' },
                    { type: 'file', name: 'input.tsx' },
                ]
            },
            { type: 'file', name: 'app.ts' },
            { type: 'file', name: 'index.ts' },
        ]
    },
    {
        type: 'file',
        name: 'package.json'
    },
    {
        type: 'file',
        name: 'tsconfig.json'
    }
]

test('expand tsproject with count 2', () => {
    expect(expand(2, tsproject)).toEqual([
        { type: 'folder', name: 'src', indent: 1 },
        { type: 'omit', indent: 1 },
    ])
})

test('expand tsproject with count 3', () => {
    expect(expand(3, tsproject)).toEqual([
        { type: 'folder', name: 'src', indent: 1 },
        { type: 'file', name: 'package.json', indent: 1 },
        { type: 'file', name: 'tsconfig.json', indent: 1 },
    ])
})

test('expand tsproject with count 4', () => {
    expect(expand(4, tsproject)).toEqual([
        { type: 'folder', name: 'src', indent: 1 },
        { type: 'file', name: 'package.json', indent: 1 },
        { type: 'file', name: 'tsconfig.json', indent: 1 },
    ])
})

test('expand tsproject with count 5', () => {
    expect(expand(5, tsproject)).toEqual([
        { type: 'folderExpanded', name: 'src', indent: 1 },
        { type: 'folder', name: 'components', indent: 2 },
        { type: 'omit', indent: 2 },
        { type: 'file', name: 'package.json', indent: 1 },
        { type: 'file', name: 'tsconfig.json', indent: 1 },
    ])
})

test('expand tsproject with count 6', () => {
    expect(expand(6, tsproject)).toEqual([
        { type: 'folderExpanded', name: 'src', indent: 1 },
        { type: 'folder', name: 'components', indent: 2 },
        { type: 'file', name: 'app.ts', indent: 2 },
        { type: 'file', name: 'index.ts', indent: 2 },
        { type: 'file', name: 'package.json', indent: 1 },
        { type: 'file', name: 'tsconfig.json', indent: 1 },
    ])
})

test('expand tsproject with count 7', () => {
    expect(expand(7, tsproject)).toEqual([
        { type: 'folderExpanded', name: 'src', indent: 1 },
        { type: 'folder', name: 'components', indent: 2 },
        { type: 'file', name: 'app.ts', indent: 2 },
        { type: 'file', name: 'index.ts', indent: 2 },
        { type: 'file', name: 'package.json', indent: 1 },
        { type: 'file', name: 'tsconfig.json', indent: 1 },
    ])
})

test('expand tsproject with count 8', () => {
    expect(expand(8, tsproject)).toEqual([
        { type: 'folderExpanded', name: 'src', indent: 1 },
        { type: 'folderExpanded', name: 'components', indent: 2 },
        { type: 'file', name: 'button.tsx', indent: 3 },
        { type: 'file', name: 'input.tsx', indent: 3 },
        { type: 'file', name: 'app.ts', indent: 2 },
        { type: 'file', name: 'index.ts', indent: 2 },
        { type: 'file', name: 'package.json', indent: 1 },
        { type: 'file', name: 'tsconfig.json', indent: 1 },
    ])
})
