run:
	./mvnw spring-boot:run 
db:      
	docker rm -f courseonlinedb
	docker volume create courseonlinedb_data
	docker run --name courseonlinedb \
  	-e POSTGRES_USER=midbenke \
  	-e POSTGRES_PASSWORD=123456 \
  	-e POSTGRES_DB=blogdb \
  	-p 5432:5432 \
	-v courseonlinedb_data:/var/lib/postgresql/data \
  	-d postgres:15
db_bash:
	docker exec -it courseonlinedb bash 
admin:
	./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8081 --admin"
start_db:
	docker start courseonlinedb
clean:
	./mvnw clean
build:
	./mvnw clean package -
dependency-update:
	./mvnw versions:use-latest-releases
