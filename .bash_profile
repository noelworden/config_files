export PS1="$GREEN\u$NO_COLOR:\w$YELLOW\$(parse_git_branch)$NO_COLOR\$ "
export CLICOLOR=1
export LSCOLORS=ExFxBxDxCxegedabagacad
export PATH=/usr/local/bin:$PATH ##This may need to change
#export VISUAL=atom
#export EDITOR="$VISUAL"
#export BUNDLER_EDITOR='atom -w'
# export PATH="$HOME/.rbenv/bin:$PATH"
# eval "$(rbenv init -)"

RED="\[\033[0;31m\]"
YELLOW="\[\033[0;33m\]"
GREEN="\[\033[0;32m\]"
NO_COLOR="\[\033[0m\]"

function parse_git_branch () {
  git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

source ~/.profile

[[ -s "$HOME/.profile" ]] && source "$HOME/.profile" # load the default bash profile on startx

####### ALIAS LIST #######
alias cl='clear'
alias be='bundle exec'
alias video="sudo killall VDCAssistant"

alias showFiles='defaults write com.apple.finder AppleShowAllFiles YES; killall Finder /System/Library/CoreServices/Finder.app'
alias hideFiles='defaults write com.apple.finder AppleShowAllFiles NO; killall Finder /System/Library/CoreServices/Finder.app'
alias resource='source ~/.bash_profile'

# Uncomment if you find that you need a fast way to fire up a PG server from $
# alias pggo='/usr/local/Cellar/postgresql93/9.3.5/bin/pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start'
# alias pgno='/usr/local/Cellar/postgresql93/9.3.5/bin/pg_ctl -D  /usr/local/var/postgres stop -s -m fast'

#####CANVAS######

#cd woods-bagot
alias wb="cd canvas/woods-bagot"

#cd nude
alias nude="cd canvas/nude-skincare"

#cd ward village
alias wv="cd canvas/WardVillage"

#cd dataminr
alias data="cd canvas/Dataminr"

#####################

#git
alias gcb="git checkout -b"

alias gb="git branch"

alias gc="git checkout"

alias gs="git status"

alias ga="git add"

alias gcm="git commit -m"

alias gcp="git commit -p"

alias gdif="git diff --cached"

alias gmas="git checkout master"

alias gl='git log -15 --pretty=format:'\''%C(yellow)%h %Cgreen%ad %Cred%an %Creset%s %Cgreen%d'\'' --date=short'

#heroku
alias heroku!="git push heroku master"

#git push origin
alias gpush="git push --set-upstream origin"

######################

#db
alias rollback="rake db:rollback"
alias migrate="rake db:migrate db:test:prepare"
alias seed="rake db:seed"
alias reset="rake db:reset"

# rails cmd helpers
alias dboom="rake db:drop db:create db:migrate db:seed"

alias dbup="rake db:create db:migrate db:seed"

# open bash-profile
alias bashpro='vim ~/.bash_profile'

# git autocomplete
if [ -f ~/.git-completion.bash ]; then
  . ~/.git-completion.bash
fi

export PATH="/usr/local/bin:$PATH"

[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
