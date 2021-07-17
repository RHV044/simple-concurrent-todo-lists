#!/bin/bash

npm install
echo ""
echo "====================================================="
read -p "Levantamos el Registry + 3 nodos... ENTER"
echo "====================================================="
gnome-terminal -- npm run startRegistry
gnome-terminal -- npm start --port 9001
gnome-terminal -- npm start --port 9002
gnome-terminal -- npm start --port 9003
google-chrome ./frontend/index.html
echo ""
echo "====================================================="
read -p "Crea 2 listas vacias, distintas e impactando en nodos distintos... ENTER"
echo "====================================================="
content="Content-Type:application/json";
hash="x-list-hash:2914";
curl -H $content -H $hash -X POST -d '{"list":{"title":"Primera lista","creator":"script"}}' http://localhost:9001/lists
curl -H $content -H $hash -X POST -d '{"list":{"title":"Listerna","creator":"script"}}' http://localhost:9002/lists

echo ""
echo "====================================================="
read -p "Esto prueba que eliminamos la chance de conflict con el quorum de escritura. Solo se graba en los nodos la primer modificacion... ENTER"
echo "====================================================="
curl -H $content -H $hash -X POST -d '{"item":{"text":"dohomework","done":false}}' http://localhost:9001/lists/1/items &
#curl -H $content -H $hash -X POST -d '{"item":{"text":"doNOTdohomework","done":false}}' http://localhost:9002/lists/1/items &
#curl -H $content -H $hash -X POST -d '{"item":{"text":"doNOTdohomework_ASDA","done":false}}' http://localhost:9003/lists/1/items &
echo ""
echo "====================================================="
read -p "Levantamos nodo 9004 y deberia sincronizarse con todo lo de los demas... ENTER"
echo "====================================================="
gnome-terminal -- npm start --port 9004

echo ""
echo "====================================================="
read -p "Al modificar la lista en este nodo nuevo, se replica tambien en todos los demas... ENTER"
echo "====================================================="
hash="x-list-hash:-1970392825";
curl -H $content -H $hash -X POST -d '{"item":{"text":"EstoSeAgregoEnElNodo9004","done":false}}' http://localhost:9001/lists/1/items
echo ""
echo "====================================================="
read -p "Vamos a matar la conexión del nodo 9001 (sigue corriendo el proceso pero aislado)... ENTER"
echo "====================================================="
iptables -I INPUT -p tcp --dport 9001 -j REJECT


echo ""
echo "====================================================="
read -p "Agregamos información al cluster... ENTER"
echo "====================================================="
hash="x-list-hash:1796987108"
curl -H $content -H $hash -X POST -d '{"item":{"text":"EstoSeAgregoCon9001Caido","done":true}}' http://localhost:9002/lists/1/items


echo ""
echo "====================================================="
read -p "Levantamos devuelta 9001 y deberia sincronizarse con todo eventualmente... ENTER"
echo "====================================================="
iptables -I INPUT -p tcp --dport 9001 -j ACCEPT




echo ""
echo "====================================================="
read -p "Que pasa si perdemos conexion con el registry 9000 e insertamos datos... ENTER"
echo "====================================================="
iptables -I INPUT -p tcp --dport 9000 -j REJECT
curl -H $content -H $hash -X POST -d '{"item":{"text":"EstoSeAgregoConElRegistry9000Caido","done":true}}' http://localhost:9004/lists/1/items




iptables -I INPUT -p tcp --dport 9000 -j ACCEPT
iptables -I INPUT -p tcp --dport 9001 -j ACCEPT
iptables -I INPUT -p tcp --dport 9002 -j ACCEPT
iptables -I INPUT -p tcp --dport 9003 -j ACCEPT
iptables -I INPUT -p tcp --dport 9004 -j ACCEPT
