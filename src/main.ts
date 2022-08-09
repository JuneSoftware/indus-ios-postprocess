import * as core from '@actions/core'
import * as unzip from 'unzipper';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import path from 'path';

function run(): void {
  const packagePath = core.getInput('zipPath');
  const rootFolderName = core.getInput('zipRootName');
  const outputPath = core.getInput('outputPath');
  const changelog = core.getInput('changelog');
  const tempPath = 'tempPath';
  const tempPathResult = path.join(tempPath, rootFolderName);

  fs.writeFileSync('Changelog.txt', changelog)

  fs.createReadStream(packagePath).pipe(unzip.Extract({ path: tempPath })).on('close', function () {
    try {
      move(tempPathResult, outputPath);
    }
    catch(ex) {
      console.log(ex)
    }
    fsExtra.removeSync(tempPath);
    fsExtra.removeSync(packagePath);
  });
}

function move(oldPath: string, newPath: string) {
  if (!fsExtra.existsSync(newPath)) {
    fsExtra.mkdirSync(newPath);
  }

  fsExtra.readdirSync(oldPath).forEach(file => {
    console.log(file);
    var filePath = path.join(oldPath, file);
    if (!fsExtra.statSync(filePath).isDirectory()) {
      var dest = path.join(newPath, file);
      fsExtra.moveSync(filePath, dest);
    }
    else {
      var dest = path.join(newPath, file);
      move(filePath, dest);
    }
  });
}

run()
