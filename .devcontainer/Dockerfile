# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=20-bookworm
FROM mcr.microsoft.com/devcontainers/typescript-node:${VARIANT}

# install mcfly as root
RUN curl -LSfs https://raw.githubusercontent.com/cantino/mcfly/master/ci/install.sh | sh -s -- --git cantino/mcfly 

# install fblog json log parser (https://github.com/brocode/fblog)
RUN wget https://github.com/brocode/fblog/releases/download/v4.4.0/fblog && chmod +x fblog && mv fblog /usr/local/bin

USER node

# Install and configure starship.rs prompt
RUN curl -fsSL https://starship.rs/install.sh | sh -s -- --yes
RUN echo "eval \"\$(starship init bash)\"" >> ~/.bashrc && echo "eval \"\$(starship init zsh)\"" >> ~/.zshrc

# install mcfly config
RUN echo 'eval "$(mcfly init zsh)"' >> ~/.zshrc \
    && touch ~/.zsh_history

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list -here>"
