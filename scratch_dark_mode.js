const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.next') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalCont = content;

    // Backgrounds
    content = content.replace(/bg-white/g, 'bg-[#111111]');
    content = content.replace(/bg-gray-50/g, 'bg-black');
    content = content.replace(/bg-gray-100/g, 'bg-[#1a1a1a]');
    content = content.replace(/bg-gray-200/g, 'bg-[#333333]');
    
    // Text colors
    content = content.replace(/text-gray-900/g, 'text-white');
    content = content.replace(/text-gray-800/g, 'text-gray-100');
    content = content.replace(/text-gray-700/g, 'text-gray-300');
    content = content.replace(/text-gray-600/g, 'text-gray-400');
    
    // Borders
    content = content.replace(/border-gray-100/g, 'border-[#333333]');
    content = content.replace(/border-gray-200/g, 'border-[#333333]');
    content = content.replace(/border-gray-300/g, 'border-[#444444]');
    
    // Focus rings
    content = content.replace(/focus:ring-blue-500/g, 'focus:ring-[#D4537E]');
    content = content.replace(/text-blue-600/g, 'text-[#D4537E]');
    content = content.replace(/bg-blue-600/g, 'bg-[#D4537E]');
    content = content.replace(/bg-blue-700/g, 'bg-[#993556]');
    content = content.replace(/hover:bg-blue-700/g, 'hover:bg-[#993556]');
    content = content.replace(/accent-blue-600/g, 'accent-[#D4537E]');
    
    // The previous Login gradient button used #D4537E anyway, so that holds.

    if (content !== originalCont) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
