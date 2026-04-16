FROM eclipse-temurin:21-jdk-alpine AS builder
 
WORKDIR /app

COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .

RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src/ src/
RUN ./mvnw package -DskipTests --no-transfer-progress

FROM eclipse-temurin:21-jre-alpine
 
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/target/*.jar app.jar

# Variáveis de ambiente do Render
ENV JAVA_OPTS=" "   
ENV SERVER_PORT=8080
 
EXPOSE 8080
 
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]