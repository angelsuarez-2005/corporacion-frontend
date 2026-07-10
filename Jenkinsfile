pipeline {
  agent any
  environment {
    scannerHome = tool 'SonarQube Scanner'
  }
  stages {
    stage('Inicio de pruebas de calidad - Color Lens Vision SAC') {
      steps {
        echo 'Iniciando pipeline de pruebas de calidad del sistema Color Lens Vision SAC'
      }
    }
    stage('Construcción del sistema') {
      steps {
        echo 'Construyendo el sistema Color Lens Vision SAC...'
      }
    }
    stage('Ejecución de pruebas') {
      steps {
        echo 'Ejecutando pruebas funcionales del sistema Color Lens Vision SAC...'
      }
    }
    stage('Análisis de calidad con SonarQube') {
      steps {
        withSonarQubeEnv('prueba_calidad') {
          bat "\"${scannerHome}\\bin\\sonar-scanner.bat\" -Dsonar.projectKey=color-lens-vision-sac -Dsonar.projectName=color-lens-vision-sac -Dsonar.sources=src"
        }
      }
    }
    stage('Finalización del pipeline') {
      steps {
        echo 'Pipeline de pruebas de calidad finalizado para Color Lens Vision SAC'
      }
    }
  }
}
