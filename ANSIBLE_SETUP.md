# Development Environment Setup with Ansible

This Ansible playbook automates the setup of your development environment for the Bibliotheque project, handling installation of all necessary tools and dependencies.

## Prerequisites

### macOS

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Ansible via Homebrew
brew install ansible
```

### Ubuntu/Debian

```bash
# Update package list
sudo apt-get update

# Install Ansible
sudo apt-get install ansible python3-pip
```

### All Systems

```bash
# Verify Ansible installation
ansible --version
```

## What Gets Installed

✅ **Docker** - Container platform for development and deployment
✅ **Docker Compose** - Multi-container Docker applications
✅ **Python 3** - Server runtime environment
✅ **pip** - Python package manager
✅ **Python venv** - Virtual environment for Python
✅ **Node.js** - Client-side JavaScript runtime
✅ **npm** - Node.js package manager
✅ **Git** - Version control system
✅ **curl** - Command-line data transfer tool
✅ **SQLite** - Database engine

## Running the Playbook

### Basic Usage

```bash
# Run the playbook
ansible-playbook setup-dev-environment.yml

# Run with verbose output (helpful for debugging)
ansible-playbook setup-dev-environment.yml -v

# Run with extra verbosity
ansible-playbook setup-dev-environment.yml -vv
```

### macOS-Specific Notes

If you have Homebrew installed, the playbook will use it for installations. On macOS, you may be prompted to enter your password for `sudo` commands.

```bash
# Allow password prompts
ansible-playbook setup-dev-environment.yml --ask-become-pass
```

### Ubuntu/Debian-Specific Notes

Since this uses package manager installations that require `sudo`, you'll likely need to provide password:

```bash
# Run with sudo password prompt
ansible-playbook setup-dev-environment.yml --ask-become-pass
```

## What the Playbook Does

1. **Updates Package Manager**
   - Homebrew (macOS) or apt-get (Ubuntu/Debian)

2. **Installs Docker & Docker Compose**
   - Enables Docker daemon (Ubuntu/Debian)
   - Adds user to docker group (Ubuntu/Debian)

3. **Installs Python Environment**
   - Python 3 runtime
   - pip (package manager)
   - venv (virtual environment)

4. **Installs Node.js**
   - Direct installation via Homebrew (macOS)
   - Via NVM (Node Version Manager) on Ubuntu/Debian

5. **Installs Additional Tools**
   - Git, curl, SQLite3

6. **Sets Up Project**
   - Creates Python virtual environment
   - Installs Python dependencies from `requirements.txt`
   - Initializes the database

7. **Verifies Installation**
   - Displays version information for all installed tools
   - Shows project structure and next steps

## After Running the Playbook

### Activate Python Virtual Environment

```bash
cd server
source venv/bin/activate
```

### Run the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### Set Up Client (if applicable)

```bash
cd client
npm install
npm start
```

## Troubleshooting

### Docker Permission Denied

On Ubuntu/Debian, after the playbook completes, you may need to restart your shell session or run:

```bash
newgrp docker
```

### Python Virtual Environment Issues

If the virtual environment fails to activate, try creating it manually:

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node.js Not Found (Ubuntu/Debian)

The playbook installs NVM. You may need to restart your terminal to use Node.js:

```bash
source ~/.nvm/nvm.sh
node --version
```

### Ansible Permission Issues

Use the `--ask-become-pass` flag and enter your sudo password:

```bash
ansible-playbook setup-dev-environment.yml --ask-become-pass
```

## Customization

You can customize the playbook by editing these variables at the top:

```yaml
vars:
  node_version: "18.x" # Change Node.js version
  python_version: "3.11" # Change Python version
```

## Supported Platforms

- ✅ macOS (with Homebrew)
- ✅ Ubuntu 20.04+
- ✅ Debian 10+

## Getting Help

If you encounter issues:

1. Check the verbose output: `ansible-playbook setup-dev-environment.yml -vv`
2. Ensure your system is up to date: `sudo apt update && sudo apt upgrade` (Ubuntu/Debian)
3. For Docker issues on Linux, see: https://docs.docker.com/engine/install/
4. For Ansible issues, see: https://docs.ansible.com/

## Next Steps

1. Run the playbook as described above
2. Verify installation: `docker --version`, `python3 --version`, `node --version`
3. Activate the Python environment: `source server/venv/bin/activate`
4. Start developing!
