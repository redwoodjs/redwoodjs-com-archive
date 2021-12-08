# Windows Development Setup

This guide provides a simple setup to start developing a RedwoodJS project on Windows. Many setup options exist, but this aims to make getting started as easy as possible. This is the recommended setup unless you have experience with other shell like PowerShell. 

> If you're interested in using the Windows Subsystem for Linux instead, there is a [community guide for that](https://community.redwoodjs.com/t/windows-subsystem-for-linux-setup/2439).

### Git Bash

Download the last release of [**Git for Windows**](https://git-scm.com/download/win) and install it. 
When installing Git, you can add the icon on the Desktop and add Git Bash profile to Windows Terminal if you use it, but it is optional. 

![1-git components.png](Windows%20setup%20for%20Redwood%20aa3e6e732a8440708763a609984ce495/1-git_components.png)

Next, set VS Code as Git default editor (or default for the editor you use). 

![2-git editor.png](Windows%20setup%20for%20Redwood%20aa3e6e732a8440708763a609984ce495/2-git_editor.png)

For every other step, we recommended keeping to the default choice.

### Node.js environment (and npm)

We recommend you install the latest `nvm-setup.zip` of [**nvm-windows**](https://github.com/coreybutler/nvm-windows/releases) to manage multiple version installations of Node.js. When the installation of nvm is complete, run Git Bash as administrator to install Node with npm. 

![3- git run as admin.png](Windows%20setup%20for%20Redwood%20aa3e6e732a8440708763a609984ce495/3-_git_run_as_admin.png)

Redwood uses the LTS version of Node. To install, run the following commands inside the terminal: 

```bash
$ nvm install lts --latest-npm
// installs latest LTS and npm; e.g. 16.13.1 for the following examples
$ nvm use 16.13.1
```

### Yarn

Now you have both Node and npm installed! Redwood also uses yarn, which you can now install using npm:

```bash
 npm install -g yarn
```

*Example of Node.js, npm, and Yarn installation steps*

![4.1-install yarn.png](Windows%20setup%20for%20Redwood%20aa3e6e732a8440708763a609984ce495/4.1-install_yarn.png)

## Congrats!

You now have everything ready to build your Redwood app. Just run:

```bash
yarn create redwood-app ./myApp 
```

Next, you should start the amazing [**Redwood Tutorial**](https://learn.redwoodjs.com/docs/tutorial/installation-starting-development) to learn how to use the framework. 

>⚠️ Heads Up  
On Windows Git Bash, `cd dev` and `cd Dev` will select the same directory because Windows is case-insensitive. But make sure you type the original capitalization to avoid strange errors in your Redwood project.