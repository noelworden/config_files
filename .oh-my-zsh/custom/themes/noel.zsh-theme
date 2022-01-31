PROMPT=$'%{$reset_color%}%{$fg[magenta]%}%~%{$reset_color%} $(git_prompt_info)
%{$fg[white]%}    ❯%{$reset_color%} '

ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[blue]%}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY=" %{$fg[white]%}⚡%{$fg[green]%}"
ZSH_THEME_GIT_PROMPT_CLEAN=""
