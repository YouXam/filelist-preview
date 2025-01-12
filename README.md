# FileList Preview Generator

A simple and efficient service to generate visual previews of file directory structures. This project provides both PNG and SVG output formats through a convenient API.

![Demo](demo.svg)

## Features

- Generate visual file tree previews
- Support for both files and folders
- Output in PNG or SVG format
- Highly customizable

## API Usage

The service provides two endpoints:

- `POST /png` - Generate PNG preview
- `POST /svg` - Generate SVG preview

### Request Format

Send a POST request with a JSON body containing your file structure:

```sh
curl 'https://filelist.youxam.workers.dev/svg' \
  -H 'Content-Type: application/json' \
  -d '{
  "height": 250,
  "files": [
    {
      "type": "folder",
      "name": "src",
      "children": [
        {
          "type": "folder",
          "name": "components",
          "children": [
            { "type": "file", "name": "button.tsx" },
            { "type": "file", "name": "input.tsx" }
          ]
        },
        { "type": "file", "name": "app.ts" },
        { "type": "file", "name": "index.ts" }
      ]
    },
    { "type": "file", "name": "package.json" },
    { "type": "file", "name": "tsconfig.json" }
  ]
}' -o demo.svg
```

### Request Schema

The API accepts JSON data following this TypeScript schema:

```typescript
type Node = {
  type: 'folder';
  name: string;
  children: Node[];
} | {
  type: 'file';
  name: string;
};

interface RequestBody {
	files: Node[];
	title?: string;
	fontSize?: number;
	height?: number;
	width?: number;
}
```

### Optional Parameters

- `title`: Add a custom title to your preview
- `fontSize`: Customize the text size
- `height`: Set the height of the output image
- `width`: Set the width of the output image

## LICENSE

[MIT](LICENSE)
