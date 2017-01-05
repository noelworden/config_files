export PS1="$GREEN\u$NO_COLOR:\w$YELLOW\$(parse_git_branch)$NO_COLOR\$ "
export CLICOLOR=1
export LSCOLORS=ExFxBxDxCxegedabagacad
export PATH=/usr/local/bin:$PATH ##This may need to change
export PATH=/bin:/sbin:/usr/bin:/usr/local/sbin:/usr/local/bin:$PATH
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

##### Project Paths ####

#cd bloccit path
alias bloccit="cd bloc/code/bloccit"

#cd toboom path
alias toboom="cd bloc/prjct01/toboom/"

#cd wikster path
alias wikster="cd bloc/prjct02/wikster"

#cd fitness_apocalypse path
alias fa="cd bloc/prjct03/fitness_apocalypse"

#cd bloc-jams path
alias jams="cd bloc/bloc-jams"

#cd parkfinder path
alias park="cd bloc/prjct04/parkfinder"

#cd bloc-jams-angular
alias ang="cd bloc/bloc-jams-angular"

#############

#git
alias branch="git checkout -b"

alias gs="git status"

alias gcm="git commit -m"

alias gcp="git commit -p"

alias gdif="git diff --cached"

alias gmas="git checkout master"

alias gl='git log -15 --pretty=format:'\''%C(yellow)%h %Cgreen%ad %Cred%an %Creset%s %Cgreen%d'\'' --date=short'
#heroku
alias heroku!="git push heroku master"

#waffle orign push
alias wpush="git push --set-upstream origin"

#db
alias migrate="rake db:migrate"
alias seed="rake db:seed"
alias reset="rake db:reset"

# rails cmd helpers
alias dboom="rake db:drop db:create db:migrate db:seed"

# open bash-profile
alias bashpro='vim ~/.bash_profile'

# Exercism
alias satan='cd ~/exercism/ruby && rvm gemset use exercism'

export PATH="/usr/local/bin:$PATH"

[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
