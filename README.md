- Use entire Home Directory as Git Repo
  - `cd ~`
  - `git init`

- Push all files to `.gitignore` 
  - `echo "*" > .gitignore`
  
- Check repo status, nothing should be tracked
  - `git status`

- Start pulling files from `.gitignore`
  - `git add -f .bashrc`
  - `git add -f .vimrc`
  
- Current file list:
  ```
  .atom/
  .bash_profle
  .bashrc
  .customgitmsg.txt
  .gitconfig
  .profile
  .tmux.conf
  .vimrc
  .vim
  .vscode
  com.googlecode.iterm2
  ```
  
- Commit the tracked files
  - `git commit -m "clever message here"`

- Create repo

- Push to repo
  
## Resources
- https://www.digitalocean.com/community/tutorials/how-to-use-git-to-manage-your-user-configuration-files-on-a-linux-vps
