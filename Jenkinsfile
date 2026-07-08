pipeline {
  agent any

  environment {
    scannerHome = tool 'SonarQube Scanner'
  }

  stages {
    stage('Inicio') {
      steps {
        echo 'Hola desde Jenkins en Windows'
      }
    }

    stage('Construcción') {
      steps {
        echo 'Simulando construcción...'
      }
    }

    stage('Pruebas') {
      steps {
        echo 'Ejecutando pruebas...'
      }
    }

    stage('Análisis SonarQube') {
      steps {
        withSonarQubeEnv('prueba_calidad') {
          bat "\"${scannerHome}\\bin\\sonar-scanner.bat\" -Dsonar.projectKey=corporacion-frontend -Dsonar.projectName=corporacion-frontend -Dsonar.sources=src"
        }
      }
    }

    stage('Finalización') {
      steps {
        echo 'Pipeline finalizado'
      }
    }
  }
}
