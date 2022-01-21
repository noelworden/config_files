# If you come from bash you might have to change your $PATH.
export PATH=$HOME/bin:/usr/local/bin:$PATH
export ZSH="/Users/noelworden/.oh-my-zsh"
export AWS_PROFILE=retail-dev-MystiqueDev

#details: https://www.2daygeek.com/understanding-the-color-code-of-linux-files/
LS_COLORS='no=00;37:fi=00;90:di=04;95:ln=00;36'
export LS_COLORS
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}

ZSH_THEME="noel"

#made manual color changes to this theme
# ZSH_THEME="miloshadzic"
# ZSH_THEME="refined"

plugins=(
  asdf
  zsh-autosuggestions
  )

source $ZSH/oh-my-zsh.sh

####### ALIAS LIST #######
#BlockFi project aliases
alias bcommit="pre-commit && git commit -S"
alias myst="cd ~/blockfi/blockfi-mystique"
# alias mystdb="docker run --rm -p 5432:5432 -e POSTGRES_DB=$DB_NAME -e POSTGRES_USER=$DB_USERNAME -e POSTGRES_PASSWORD=$DB_PASSWORD -v postgres_data:/var/lib/postgresql/data postgres:10-alpine"

# added more detailed logging
alias obdb="docker run --rm -p 6432:5432 -e POSTGRES_DB=$DB_NAME -e POSTGRES_USER=$DB_USERNAME -e POSTGRES_PASSWORD=$DB_PASSWORD -v postgres_data:/var/lib/postgresql/data postgres:10-alpine -c log_statement=all"
alias mystdb="docker run --rm -p 5432:5432 -e POSTGRES_DB=$DB_NAME -e POSTGRES_USER=$DB_USERNAME -e POSTGRES_PASSWORD=$DB_PASSWORD -v postgres_data_myst:/var/lib/postgresql/data postgres:10-alpine"
alias otherdb="docker run --rm -p 5432:5432 -e POSTGRES_DB=music_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -v postgres_data_aux:/var/lib/postgresql/data postgres:10-alpine"
alias notes="code ~/blockfi/blockfi_notes/blockfi_notes.md"
alias burner="code ~/_burner_commit_message.md"
################
#admin
alias bashpro="code ~/.zshrc"
alias showFiles='defaults write com.apple.finder AppleShowAllFiles YES; killall Finder /System/Library/CoreServices/Finder.app'
alias hideFiles='defaults write com.apple.finder AppleShowAllFiles NO; killall Finder /System/Library/CoreServices/Finder.app'
alias resource='. ~/.zshrc'

#thefuck
eval $(thefuck --alias)

#BlockFi specfic admin
alias restartgpg='killall gpg-agent && gpg-agent --daemon'

#this is an attempt to have gpg not die between iTerm tabs
if [ -z $SSH_TTY ]; then
    export GPG_TTY=$(tty)
    export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)
    gpg-connect-agent -q updatestartuptty /bye >> /dev/null
fi

################
#git
alias gcb="git checkout -b"
alias gb="git branch"
alias recentbranches='git branch --sort=-committerdate --format="%(committerdate:relative)%09%(refname:short)"'
alias gc="git checkout"
alias gs="git status"
alias ga="git add"
# alias gcm="git commit -m"
# alias gcp="git commit -p"

alias iexcheck="grep -r \"require IEx\" lib test"
alias blockficommit="grep -r \"require IEx\" lib test; mix format && pre-commit && git commit -S"
alias gdif="git diff --cached"
alias diffword="git diff --word-diff-regex=."
alias gmas="git checkout main"
# alias gmas="git checkout main"
alias gl='git log -15 --pretty=format:'\''%C(yellow)%h %Cgreen%ad %Cred%an %Creset%s %Cgreen%d'\'' --date=short'
alias gl20='git log -20 --pretty=format:'\''%C(yellow)%h %Cgreen%ad %Cred%an %Creset%s %Cgreen%d'\'' --date=short'
alias gbd='git branch -d'
alias branchboom='git branch | grep -v "master" | xargs git branch -D'
alias hard='git reset HEAD --hard'
alias gpull='git pull'
alias gpush='git push'
alias gpushf='git push --force-with-lease'
alias gpush="git push --set-upstream origin"
alias rebase="git fetch && git rebase origin/main"
alias amendall='mix format && git add . && git commit --amend'
alias amend='git commit --amend'
alias all='git add . && git commit'
# remove all untracked files
alias gitclean='git clean -d -f'
alias gpatch='git add --patch'

################
#docker
alias dc="docker-compose"
alias dcup="docker-compose up"
alias dcdown="docker-compose down"
alias dcupb="docker-compose up --build"
alias killdockers="docker image prune"
alias dcmigrate="dc exec web mix ecto.migrate"

################
#elixir
## iex command with docker
# alias econ='docker-compose exec web iex --erl "-kernel shell_history enabled" -S mix'
## iex without docker
alias econ='iex --erl "-kernel shell_history enabled" -S mix'
alias econtest='MIX_ENV=test iex --erl "-kernel shell_history enabled" -S mix'
alias formatall="docker-compose exec web mix format"

################
#functions
irebase () { git rebase -i HEAD~"$1";}
ireset () { git reset HEAD~"$1";}
# iroll () { dc exec web mix ecto.rollback --step "$1";}
iroll () { mix ecto.rollback --step "$1";}
imeet () { cd ~ && open -a "Google Chrome" "https://""$1";}
ddg () { open -a "Firefox" "https://www.duckduckgo.com/?q=$1";}
# ggl () { open -a "Google Chrome" "https://www.google.com/search?q=$1";}

################
#BlockFi specific ops setup

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/Users/noelworden/.asdf/installs/python/anaconda3-2020.02/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/Users/noelworden/.asdf/installs/python/anaconda3-2020.02/etc/profile.d/conda.sh" ]; then
        . "/Users/noelworden/.asdf/installs/python/anaconda3-2020.02/etc/profile.d/conda.sh"
    else
        export PATH="/Users/noelworden/.asdf/installs/python/anaconda3-2020.02/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<
#for direnv
eval "$(direnv hook zsh)"
