# AppVersion Manager

<a name="status"></a>

[![AppVersionManager-version](https://img.shields.io/badge/Version-0.8.2-brightgreen.svg?style=flat)](https://www.npmjs.com/package/appversion-mgr/v/0.8.2)
[![AppVersionManager-status](https://img.shields.io/badge/Status-preview%201-brightgreen.svg?style=flat)](https://github.com/x-company/appversion-mgr#status)
[![AppVersionManager-build](https://img.shields.io/badge/Builds-66-brightgreen.svg?style=flat)](https://github.com/x-company/appversion-mgr#status)

**AppVersion Manager** is a Fork from [dlvedor](https://github.com/delvedor) great [AppVersion](https://github.com/delvedor/appversion) CLI Tool. Thanks to your great Work. And its completly refactored and rewritten in TypeScript.

I want to use this Tool to manage my DotNet Core Projects. Everyone knows, that in an Visual Studio Solution exists many Projects with its own Version Management. But AppVersion can only manage one Versions File in the Root of the Project. So i decided to fork this great Tool and add the abbility to define an Directory, where the ```appversion.json``` should  created.

What are the major Changes?

- ```appversion.json``` will automaticall created where the Tool is currently running. An Init is not neccessary.
- Additonally you can specifiy the ```-d --directory``` Parameter to manage more than one ```appversion.json``` (Mostly needed by DotNet Solutions).
- Readme.md will automatically created if it not exists
- Fix errors while Updating the .md Files. Badges wasn't updated successfully
- Extend/Rewrite the API
- Template for Badges with replacing of Pattern Placeholders
- Template for Git Tag can configured per Project
- Completly rewritten in TypeScript
- Completly restructured Source Code

---

**AppVersion Manager** is a CLI tool whose purpose is to provide a **unique manager** of the version of you application.
It follows the **semver** guidelines, so the version of your code is divided in Major, Minor and Patch, [here](http://semver.org/) you can find the Semantic Versioning specification.
In addition AppVersion keeps track of the **build** with the last build date, the build of the current version and the total number of build; it also keeps track of the **status** (stable, rc, ...) and the **commit code**.

AppVersion interacts with **NPM**, when you update the version using the AppVersion CLI tool, it updates automatically the *package.json* as well, and you can use the CLI commands inside your **NPM scripts**. See <a href="#automation">here</a> for more info about automation.
Furthermore AppVersion works well with **Git**, indeed you can add a Tag with the current version of your application to the repository and you can add one badge with the version and one badge with the status of your application to the *README.md*.
AppVersion also provides easy to use APIs to access your version, build, status and commit from your application.

The tool creates a json file named ```appversion.json``` in the root of your project with the following structure:
```json
{
  "version": {
    "major": 0,
    "minor": 0,
    "patch": 0,
    "badge": null
  },
  "status": {
    "stage": null,
    "number": 0,
    "badge": null
  },
  "build": {
    "date": null,
    "number": 0,
    "total": 0,
    "badge": null
  },
  "git":{
    "commit": null,
    "tag": "vM.m.p"
  },
  "config": {
    "schema": "x.y.z",
    "markdown": [],
    "json": [],
    "ignore": []
  }
}
```

As you can see, the version is divided in ```major```, ```minor``` and ```patch```, the build is divided in ```date```, ```number``` and ```total```, in addition, there's the status, who is divided in ```stage``` field, who can assume ```stable|rc|beta|alpha|xxx``` or what you want value and a ```number```.

Then, there's the ```config``` filed, divided in ```schema```, that is used by AppVersion for check if the json is at the latest version, ```markdown``` field where you can put all the markdown files that you want to keep updated.
The two fields inside ```config``` are, ```json```, that is the list of the *json files* who appversion must update when you change the version number, and ```ignore```, that is the list of the *folders* that AppVersion must ignore. The ```git``` section with its fields ```commit```  and ```tag``` is uses to define your own pattern for an Git Tag. The Default is ```M.m.p```. Details for the Pattern you find by the ```composePattern``` Method.

The ```badge``` Field on the ```version```, ```build``` or ```status``` Object is used to define a Template for the Badge Generation. The Template can have Placeholders like ```${M.m.p}``` (see Patterns below). This Placeholders will replaced with ```Major.Minor.Pat```.

**Needs Node.js >= 4.0.0**

## Install

Install the tool globally:
```
npm install appversion -g
```

If you want to access the ```appversion.json``` inside your application, install the module also locally:
```
npm install appversion --save
```

## Usage
### CLI:
```
$ appvmgr <cmd> <args>
```

Commands list:

| **cmd** |  **args** |   **description**
|:-------|:---------|:------------------------------------|
| update  |  major\breaking    |   Updates major number.  |
|         |  minor\feature    |   Updates minor number.   |
|         |  patch\fix    |   Updates patch number.       |
|         |  build    |   Updates build number.              |
|         |  commit   |   Updates commit code.               |
|                                                            |
| set-version |  x.y.z  |   Sets a specific version number.  |
|                                                            |
| set-status  |  stable |   Set the status to stable.        |
|         |  rc     |   Set the status to rc.                |
|         |  beta   |   Set the status to beta.              |
|         |  alpha  |   Set the status to alpha.             |
|                                                            |
| generate-badge | version | Generates the .md code of a shield badge with the version of your application.
|                | status  | Generates the .md code of a shield badge with the status of your application.
| add-git-tag    |         | Adds a tag with the version number to the git repo.
| init    |           |   Generates the appversion.json file.|

When using the *update* command, use `major|minor|patch` or `breaking|feature|fix` is the same, is a question of making **more expressive** the command and what are you doing.

Some usage examples:
```
$ appvmgr update minor
$ appvmgr set-version 1.3.2
$ appvmgr set-status rc.2
```
If you want to add a *Git tag* to your repo with the version number of your code, you have two options:
1) Add the `--tag` flag after `update` and `set-version` commands
```
$ appvmgr update minor --tag
$ appvmgr set-version 1.3.2 --tag
```
2) Use `add-git-tag`
```
$ appvmgr add-git-tag
```

By default, AppVersion updates the *"version"* field in `package.json`; if you want to update the *"version"* field in more json files, just add the file name inside *appversion.json* in the json array field.

AppVersion looks recursively inside all the subfolders of your project for json files, by default it ignores `node_modules`, `bower_components` and `.git` folders; if you want to ignore more folders just add the folder name inside *appversion.json* in the ignore array field.
If you want that AppVersion *ignores all the subfolders* in your project, just put `"*"` inside the ignore array.

<a name="generateBadge"></a>
AppVersion can provide you a wonderful shield badge with the version of your application that you can put in you .md file, like what you see at the top of this file.
Generate the badge is very easy, just type ```appvmgr generate-badge version``` for the version badge and ```appvmgr generate-badge status``` for the status badge and copy the output inside your .md file, then add the name of the md file (with the extension) inside the markdown array field in *appversion.json*, from now AppVersion will keep updated the badges every time you update your application.
*Badge examples:*
![AppVersion-version](https://img.shields.io/badge/AppVersion-2.4.1-brightgreen.svg?style=flat) ![AppVersion-status](https://img.shields.io/badge/Status-Beta.4-brightgreen.svg?style=flat)
This feature make use of the amazing service [shields.io](http://shields.io/).

### In app:

#### API
```getAppVersion(directory?: string): Promise<IAppVersion>```

```getAppVersionSync(directory?: string): IAppVersion```

Returns the content of appversion.json as a ```IAppVersion``` Object. If not directory is given, ```appvmgr``` will search in the root of the Project.


```composePattern(pattern:string): Promise<string>```

```composePattern(pattern:string, directory: string): Promise<string>```

```composePattern(pattern:string, appVersion: IAppVersion): Promise<string>```

```composePatternSync(pattern: string): string```

```composePatternSync(pattern: string, directory: string): string```

```composePatternSync(pattern: string, appVersion: IAppVersion): string```

Return a string with the version following the pattern you passed as a input.
pattern:

| **Pattern** |  **description** |
|:------------|:-----------------|
| **M \ B**   | version.major    |
| **m \ F**   | version.minor    |
| **p \ f**   | version.patch    |
| **S**       | status.stage     |
| **s**       | status.number    |
| **n**       | build.number     |
| **t**       | build.total      |
| **d**       | build.date       |
| **c**       | commit           |

The pattern must be a string, for example a pattern could be `'M.m.p-Ss n-d'`.

Sometimes you want to have the version/build number accessible in your application, for this, you can use the module with a standard import:

```typescript

import { Info } from 'appversion-mgr';

console.log(Info.getAppVersionSync());
console.log(Info.getAppVersionSync().version);

Info.getAppVersion()
  .then((data) => console.log(data))
  .catch((err) => console.log(err));


console.log(Info.composePatternSync('M.m.p-Ss n-d'))

Info.composePattern('M.m.p-Ss n-d')
  .then((data) => console.log(data))
  .catch((err) => console.log(err));

```
<a name="automation"></a>
## Automation
If you are using *npm scripts* you can easily integrate AppVersion in your workflow, below you can find an example of a package.json:
```json
...
"scripts": {
  "build": "<build command> && appvmgr update build"
},
...
```
If you are using Grunt or Gulp for automating your project, you can easily use AppVersion inside you grunt/gulp file.
Just require **appversion-mgr** and call the `update|setVersion|setStatus` methods with the correct parameter.
Below you can find an example:
```javascript
import { UpdateCommand } from 'appversion-mgr;

const command = new UpdateCommand(<directory>);
...
command.update('minor');
...
command.setVersion('1.4.2');
...
command.setStatus('Beta.2');
...

```
______________________________________________________________________________________________________________________
## License
The code is released under the MIT license.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particul
