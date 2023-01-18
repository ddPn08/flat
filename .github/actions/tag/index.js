import core from '@actions/core'
import github from '@actions/github'

const tag = github.context.ref.replace('refs/tags/', '')
core.setOutput('tag', tag)
