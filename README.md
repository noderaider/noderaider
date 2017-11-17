# [noderaider](https://github.com/noderaider/noderaider)

**A CLI to automate the noderaider packages for development.**

## install options

- `npm install --global noderaider`
- `yarn global add noderaider`

___

## cli

### bootstrap

```sh
# update and reinstall latest dependencies
noderaider update

# start noderaider repos in development mode (watch / HMR)
noderaider start

# build noderaider repos for production
noderaider build

# test all the packages
noderaider test

# publish a new version of everything
noderaider release [--next]
```

<sup>All commands automatically clone, install dependencies, and link packages if its the first run!</sup>
