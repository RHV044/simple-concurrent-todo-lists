#!/bin/bash

npm install
echo ""
echo ""
read -p "Levantamos el Registry + 3 nodos... ENTER"
gnome-terminal -- npm run startRegistry
gnome-terminal -- npm start --port 9001
gnome-terminal -- npm start --port 9002
gnome-terminal -- npm start --port 9003
google-chrome --app ./frontend/index.html
echo ""
echo ""
read -p "Crea 2 listas vacias, distintas e impactando en nodos distintos... ENTER"
content="Content-Type:application/json";
hash="x-list-hash:2914";
curl -H $content -H $hash -X POST -d '{"list":{"title":"Primera lista","creator":"script"}}' http://localhost:9001/lists
curl -H $content -H $hash -X POST -d '{"list":{"title":"Listerna","creator":"script"}}' http://localhost:9002/lists

echo ""
echo ""
read -p "Esto prueba que eliminamos la chance de conflict con el quorum de escritura. Solo se graba en los nodos la primer modificacion... ENTER"
curl -H $content -H $hash -X POST -d '{"item":{"text":"dohomework","done":false}}' http://localhost:9001/lists/1/items
curl -H $content -H $hash -X POST -d '{"item":{"text":"doNOTdohomework","done":false}}' http://localhost:9002/lists/1/items
curl -H $content -H $hash -X POST -d '{"item":{"text":"doNOTdohomework_ASDA","done":false}}' http://localhost:9003/lists/1/items
echo ""
echo ""
read -p "Levantamos nodo 9004 y deberia sincronizarse con todo lo de los demas... ENTER"
gnome-terminal -- npm start --port 9004

echo ""
echo ""
read -p "Al modificar la lista en este nodo nuevo, se replica tambien en todos los demas... ENTER"
hash="x-list-hash:-1970392825";
curl -H $content -H $hash -X POST -d '{"item":{"text":"EstoSeAgregoEnElNodo9004","done":false}}' http://localhost:9001/lists/1/items
