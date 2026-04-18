const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/app', function (filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Fix API route signatures
        content = content.replace(
            /({ params }: { params: { id: string } })/g,
            '{ params }: { params: Promise<{ id: string }> }'
        );

        // Fix API params await
        content = content.replace(/params\.id/g, '(await params).id');

        // Fix Student details page (I already tried replacing this one, let me ensure it's correct)
        // Actually the Pages (page.tsx) replacements succeeded! Only APIs failed.
        // "The following changes were made by the replace_file_content tool to: .../editor/page.tsx"
        // "The following changes were made by the replace_file_content tool to: .../student/workout/[id]/page.tsx"

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed:', filePath);
        }
    }
});
