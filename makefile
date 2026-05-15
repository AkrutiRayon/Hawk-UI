APP_NAME := hawk-ui
VERSION := 0.2.1
REGISTRY := immnan
IMAGE := $(REGISTRY)/$(APP_NAME)

PLATFORM := linux/amd64
PORT := 5000
CONTAINER_NAME := $(APP_NAME)
DOCKERFILE := ContainerFile/Dockerfile

.PHONY: help build-image push-image release run-image stop-image logs-image clean-image

help:
	@echo "Available targets:"
	@echo "  make build-image   - Build Node.js container image: $(IMAGE):$(VERSION) and $(IMAGE):latest"
	@echo "  make push-image    - Push both image tags to Docker registry"
	@echo "  make release       - Build and push both tags"
	@echo "  make run-image     - Run container locally on port $(PORT)"
	@echo "  make stop-image    - Stop and remove local container"
	@echo "  make logs-image    - Follow logs from running container"
	@echo "  make clean-image   - Remove local image tags"

build-image:
	docker buildx build \
		--platform $(PLATFORM) \
		--load \
		-f $(DOCKERFILE) \
		-t $(IMAGE):$(VERSION) \
		-t $(IMAGE):latest \
		.

push-image:
	docker push $(IMAGE):$(VERSION)
	docker push $(IMAGE):latest

release: build-image push-image

run-image:
	docker run --rm -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):5000 \
		$(IMAGE):$(VERSION)
	@echo "Container '$(CONTAINER_NAME)' started at http://localhost:$(PORT)"

stop-image:
	-docker stop $(CONTAINER_NAME)

logs-image:
	docker logs -f $(CONTAINER_NAME)

clean-image:
	-docker rmi $(IMAGE):$(VERSION)
	-docker rmi $(IMAGE):latest
