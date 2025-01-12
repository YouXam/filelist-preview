import { Context } from 'hono';
import * as React from 'react';
import { generateManifest } from 'material-icon-theme';
import { expand, Node } from './expand';

const icons = new Map<string, string>();
const manifest = generateManifest();
const extraExtensions: Record<string, string> = {
    ts: 'typescript',
    js: 'javascript',
    yaml: 'yaml',
    yml: 'yaml',
};
for (const key in extraExtensions) {
    manifest!.fileExtensions![key] = extraExtensions?.[key]!;
}

function guessIcon(filename: string, type: string = 'file') {
    if (type === 'file') {
        if (manifest?.fileNames?.[filename]) {
            return manifest.fileNames[filename];
        }
        const exts = filename.split('.')
        while (exts.length > 1) {
            exts.shift()
            if (manifest?.fileExtensions?.[exts.join('.')]) {
                return manifest.fileExtensions[exts.join('.')];
            }
        }
        return manifest.file!;
    } else if (type === 'folder') {
        if (manifest?.folderNames?.[filename]) {
            return manifest.folderNames[filename];
        }
        return manifest.folder!;
    } else if (type === 'folderExpanded') {
        if (manifest?.folderNamesExpanded?.[filename]) {
            return manifest.folderNamesExpanded[filename];
        }
        return manifest.folderExpanded!;
    }
    return 'file';
}

async function svg(context: Context, filename: string, type: string, fontSize: number) {
    const key = guessIcon(filename, type);
    if (icons.has(key)) {
        return icons.get(key);
    }
    const res = await context.env.ASSETS.fetch(`https://static.local/icons/${key}.json`);
    const body = JSON.parse(await res.text());
    body.props.style = {
        width: `${fontSize}px`,
        height: `${fontSize}px`,
    };
    icons.set(key, body);
    return body;
}
async function line(context: Context, fontSize: number, { filename, type, indent }: { filename: string; type: string; indent: number }) {
    return (
        <div
            style={{
                display: 'flex',
                paddingLeft: `${(indent - 1) * (fontSize * 1.5)}px`,
                paddingRight: '8px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                alignItems: 'center',
            }}
        >
            <span style={{ marginRight: '8px' }}>{await svg(context, filename, type, fontSize)}</span>
            {filename + ((type === 'folderExpanded' || type === 'folder') && !filename.endsWith('/') ? '/' : '')}
        </div>
    );
}
function omit(fontSize: number, { indent }: { indent: number }) {
    return <div style={{
        paddingLeft: `${(indent - 1) * (fontSize * 1.5)}px`,
        paddingRight: '8px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        color: '#888',
    }}>...</div>
}

async function render(context: Context, fontSize: number, count: number, filetree: Node[]) {
    const entries = expand(count, filetree).map(entry => {
        if (entry.type === 'omit') {
            return omit(fontSize, { indent: entry.indent })
        } else {
            return line(context, fontSize, { filename: entry.name, type: entry.type, indent: entry.indent })
        }
    })
    return await Promise.all(entries)
}

const h2Ratio = 2.49274714562423;
const lineRatio = 1.44928;

export const template = async (context: Context, files: Node[], fontSize: number, title: string | undefined, height: number) => {
    const count = Math.floor((height - (title ? fontSize * h2Ratio : 40)) / (fontSize * lineRatio));
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                backgroundColor: '#181818',
                color: '#fff',
                fontSize: `${fontSize}px`,
            }}
        >
            {title ? <h2 style={{
                textAlign: 'center',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {title}
            </h2> : null}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    paddingTop: title ? '0' : '20px',
                    overflow: 'hidden',
                }}
            >
                {await render(context, fontSize, count, files)}
            </div>
        </div>
    );
};
