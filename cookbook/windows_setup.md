# Windows Development Setup

This guide provides a simple setup to start developing a RedwoodJS project on Windows. Many setup options exist, but this aims to make getting started as easy as possible. This is the recommended setup unless you have experience with some other shell, like PowerShell. 

> If you're interested in using the Windows Subsystem for Linux instead, there is a [community guide for that](https://community.redwoodjs.com/t/windows-subsystem-for-linux-setup/2439).

### Git Bash

Download the latest release of [**Git for Windows**](https://git-scm.com/download/win) and install it. 
When installing Git, you can add the icon on the Desktop and add Git Bash profile to Windows Terminal if you use it, but it is optional. 

![1-git_components.png](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/27fac4b8-d734-4516-bcfd-b7eacf99dc9f/1-git_components.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211208%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211208T033033Z&X-Amz-Expires=86400&X-Amz-Signature=0d8ef80a9ddbd0372608ccc872486dc90ff4e2a7464d7387a233b970f4264dfd&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%221-git%2520components.png%22&x-id=GetObject)

Next, set VS Code as Git default editor (or pick any other editor you're comfortable with). 

![2-git_editor.png](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/303cd5fe-c2da-4747-8ee0-e6efad06ea99/2-git_editor.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211208%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211208T033056Z&X-Amz-Expires=86400&X-Amz-Signature=a24600f301ad20e02cbd5a0c15d89715620db44508f3b63f030cdcce0482992a&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%222-git%2520editor.png%22&x-id=GetObject)

For every other step, we recommended keeping to the default choice.

### Node.js environment (and npm)

We recommend you install the latest `nvm-setup.zip` of [**nvm-windows**](https://github.com/coreybutler/nvm-windows/releases) to manage multiple version installations of Node.js. When the installation of nvm is complete, run Git Bash as administrator to install Node with npm. 

![3-git_run_as_admin.png](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/21bf6be8-8c37-4469-9ef0-35645e622ac2/3-_git_run_as_admin.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211208%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211208T033111Z&X-Amz-Expires=86400&X-Amz-Signature=f78d5523dc342cba09e611b6a10dce417f04879e6f5fd932b6ca647b9972f54e&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%223-%2520git%2520run%2520as%2520admin.png%22&x-id=GetObject)

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

![4-install_yarn.png](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/c719a400-562f-452f-90d4-27d0aecbcbf8/4.1-install_yarn.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211208%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211208T033123Z&X-Amz-Expires=86400&X-Amz-Signature=ac97a085abb0fc8cad7cdbbe36e0404dcf73b71d23c52fa126686964843c4bbd&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%224.1-install%2520yarn.png%22&x-id=GetObject)

## Congrats!

You now have everything ready to build your Redwood app. Just run:

```bash
yarn create redwood-app ./myApp 
```

Next, you should start the amazing [**Redwood Tutorial**](https://learn.redwoodjs.com/docs/tutorial/installation-starting-development) to learn how to use the framework. 

>⚠️ Heads Up  
On Windows Git Bash, `cd myapp` and `cd myApp` will select the same directory because Windows is case-insensitive. But make sure you type the original capitalization to avoid strange errors in your Redwood project.