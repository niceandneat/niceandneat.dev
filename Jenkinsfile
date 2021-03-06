// Reference https://issues.jenkins.io/browse/JENKINS-57269
def remote = [:]
remote.name = 'web'
remote.host = '13.125.62.25'
remote.allowAnyHosts = true

pipeline {
  agent {
    docker {
      image 'node:lts'
    }
  }

  environment {
    CI = 'true'
    DIST_PATH = '/home/ubuntu/projects/niceandneat.dev'
  }

  stages {
    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }
    stage('Deploy') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'lightsail-rsa', keyFileVariable: 'identity', passphraseVariable: '', usernameVariable: 'userName')]) {
          script {
            remote.user = userName
            remote.identityFile = identity
          }
          sshCommand remote: remote, command: "mkdir -p $DIST_PATH/temp"
          sshPut remote: remote, from: 'docker-compose.yaml', into: "$DIST_PATH/docker-compose.yaml"
          sshPut remote: remote, from: 'dist', into: "$DIST_PATH/temp"
          sshScript remote: remote, script: "deploy.sh"
        }
      }
    }
  }
}
