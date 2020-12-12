default_username='noelworden'

export PS1="$GREEN"stayfrosty"$NO_COLOR:\w$YELLOW\$(parse_git_branch)$NO_COLOR\$ "
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

##  source ~/.profile

##  [[ -s "$HOME/.profile" ]] && source "$HOME/.profile" # load the default bash profile on startx

####### ALIAS LIST #######

#go to blog post directory
alias twil="cd Desktop/TWIL/"

#go to resume markdown gist file
alias resume="cd personal/resume && code resume.md"

alias jscheck="grep -Rni --include=*.tsx --include=*.ts --exclude-dir=node_modules 'console.log\|debugger' *"

alias showFiles='defaults write com.apple.finder AppleShowAllFiles YES; killall Finder /System/Library/CoreServices/Finder.app'
alias hideFiles='defaults write com.apple.finder AppleShowAllFiles NO; killall Finder /System/Library/CoreServices/Finder.app'
alias resource='source ~/.bash_profile'

# Uncomment if you find that you need a fast way to fire up a PG server from $
# alias pggo='/usr/local/Cellar/postgresql93/9.3.5/bin/pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start'
# alias pgno='/usr/local/Cellar/postgresql93/9.3.5/bin/pg_ctl -D  /usr/local/var/postgres stop -s -m fast'

# to use `fuck` -- github.com/nvbn/thefuck
eval $(thefuck --alias)

#####################
# Pineapple Payments

alias ppsetup="docker-compose run --rm web mix ecto.setup"
alias ppcreate="docker-compose run --rm web mix ecto.create"
alias ppreset="docker-compose run --rm web mix ecto.reset"
alias ppaws="bash ~/pineapple-aws.sh"
alias ppclean="docker run --rm -it -v \"$PWD:/source_files\" finance-clean bash -ic \'/source_files/clean-source-files\'"
alias ppmigrate="dc run --rm web mix ecto.migrate"
alias ppstagingpod="kubectl --context finance-staging get pods"
alias useproddump="docker-compose exec -T db psql -h localhost -U postgres -d finance_dev < prod_dump"
alias usestagingdump="docker-compose exec -T db psql -h localhost -U postgres -d finance_dev < staging_dump"
alias facts="docker-compose exec web elixir -S mix run -e 'Finance.Facts.load()'"
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

alias diffword="git diff --word-diff-regex=."

alias gmas="git checkout develop"

alias gl='git log -15 --pretty=format:'\''%C(yellow)%h %Cgreen%ad %Cred%an %Creset%s %Cgreen%d'\'' --date=short'

alias gl20='git log -20 --pretty=format:'\''%C(yellow)%h %Cgreen%ad %Cred%an %Creset%s %Cgreen%d'\'' --date=short'

alias gbd='git branch -d'

alias branchboom='git branch | grep -v "master" | xargs git branch -D'

alias hard='git reset HEAD --hard'

#git pull
alias gpull='git pull'

#git push
alias gpush='git push'

#git push --force-with-lease
alias gpushf='git push --force-with-lease'

#git push origin
alias gpush="git push --set-upstream origin"

#rebase
alias rebase="git fetch && git rebase origin/develop"

#git add all && amend
alias amendall='git add . && git commit --amend'

#git commit --amend
alias amend='git commit --amend'

#git add all and commit
alias all='git add . && git commit'

######################
#docker-compose
alias dc=docker-compose

#docker-compose up
alias dcup="docker-compose up"

#docker-compose down
alias dcdown="docker-compose down"

#docker-compose up --build
alias dcupb="docker-compose up --build"

#prune docker images
alias killdockers="docker image prune"
######################
#elixir
alias econ='docker-compose exec web iex --erl "-kernel shell_history enabled" -S mix'

alias formatall="docker-compose exec web mix format"

alias roll="dc exec web mix ecto.rollback --step 1"

######################
#linting
alias lintjs="bin/yarn lint:js --fix"

alias lintcss="bin/yarn lint:css"

#find open processes
#lsof -i tcp:
alias open3000="lsof -i tcp:3000"

#lsof -i tcp:
alias open4567="lsof -i tcp:4567"

# open bash-profile
alias bashpro='code ~/.bash_profile'

# git autocomplete
# git autocomplete
# git autocomplete
# git autocomplete
if [ -f ~/.git-completion.bash ]; then
  . ~/.git-completion.bash

  # Add git completion to aliases
  __git_complete g __git_main
  __git_complete gc _git_checkout
  __git_complete gm __git_merge
  __git_complete gp _git_pull
fi

irebase () { git rebase -i HEAD~"$1";}
ireset () { git reset HEAD~"$1";}

PATH="/usr/local/sbin:$PATH"
export PATH="/usr/local/bin:$PATH"

[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*

# BEGIN SNIPPET: Platform.sh CLI configuration
HOME=${HOME:-'/Users/noelworden'}
export PATH="$HOME/"'.platformsh/bin':"$PATH"
if [ -f "$HOME/"'.platformsh/shell-config.rc' ]; then . "$HOME/"'.platformsh/shell-config.rc'; fi # END SNIPPET

##### UNUSED ALIAS LIST #####
# alias video="sudo killall VDCAssistant"
# alias be='bundle exec'
######################
#routes
# alias rgrep="rake routes | grep"

#####################
#rspec
# alias bspec="bin/rspec"

######################
#db
# alias rollback="rake db:rollback"
# alias migrate="rake db:migrate db:test:prepare"
# alias seed="rake db:seed"
# alias reset="rake db:reset"

#####################
# rails cmd helpers
# alias dboom="rake db:drop db:create db:migrate db:test:prepare db:seed"

# alias dbup="rake db:create db:migrate db:seed"

#server
#rails webrick server
# alias brick="rails s webrick"

#####################
# start server Amica
# alias amicastart="yarn start"

# go to Amica repo, pull latest, and run yarn
# alias gotoamica="cd ~ && cd mojotech/amica && git pull && yarn"
# setup AWS bucket locally
# alias bb1="aws --endpoint-url=http://localhost:4572 s3 mb s3://demo-bucket"
# alias bb2="aws --endpoint-url=http://localhost:4575 sns create-topic --name new-source-files"
# alias bb3='aws --endpoint-url=http://localhost:4575 sns subscribe --topic-arn "arn:aws:sns:us-east-1:000000000000:new-source-files" --protocol "http" --notification-endpoint "http://web:4000/webhook/source-file-notifications"'
# alias bb4="curl -X PUT -d '<NotificationConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><TopicConfiguration><Id>some-optional-id</Id><Topic>arn:aws:sns:us-east-1:000000000000:new-source-files</Topic><Event>s3:ObjectCreated:*</Event><Filter><S3Key><FilterRule><Name>prefix</Name><Value>import/</Value></FilterRule></S3Key></Filter></TopicConfiguration></NotificationConfiguration>' -s 'http://localhost:4572/demo-bucket/?notification'"

