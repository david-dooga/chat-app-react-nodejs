pipeline {
  agent any

  environment {
        DOCKER_REGISTRY_CREDS = 'DOCKER_REGISTRY_CREDS'
	DOCKER_USER = 'doogadavid' 
        TAG = "v${BUILD_NUMBER}"
    }

  

  stages {

    stage("Clean Ups"){
        steps{
                sh 'docker compose down --rmi local --remove-orphans || true'
                sh 'docker system prune -f --filter "until=24h"' 
            }
        }
        

    stage('Build') {
      steps {
         sh "BUILD_VERSION=${TAG} docker compose build --no-cache"
      }
    }



    stage('Push Images') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
	  
          sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin docker.io"
          sh "BUILD_VERSION=${TAG} docker compose push"
	  sh "docker tag ${DOCKER_USER}/frontend:${TAG} ${DOCKER_USER}/frontend:latest"
          sh "docker tag ${DOCKER_USER}/backend:${TAG} ${DOCKER_USER}/backend:latest"
          sh "docker push ${DOCKER_USER}/frontend:latest"
          sh "docker push ${DOCKER_USER}/backend:latest"
        }
      }
    }

    stage("Deploy"){

        steps{
            sh 'docker compose up -d'
        }

    }



  }



}
