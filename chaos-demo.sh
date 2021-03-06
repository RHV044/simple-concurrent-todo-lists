#!/bin/bash
if [ $(whoami) != root ]
then # We capture the non-root user (needed)
    nonRootUser=$(whoami)
    sudo su root ${0} ${nonRootUser}
else # Only running as root
    nonRootUser=$1
    shutdown(){
        echo ""
        echo "====================================================="
        echo "Shutting down demo..."
        echo "====================================================="
        iptables -I INPUT -p tcp --dport 9000 -j ACCEPT
        iptables -I INPUT -p tcp --dport 9001 -j ACCEPT
        iptables -I INPUT -p tcp --dport 9002 -j ACCEPT
        iptables -I INPUT -p tcp --dport 9003 -j ACCEPT
        iptables -I INPUT -p tcp --dport 9004 -j ACCEPT
        exit 0
    }

    trap "shutdown" SIGINT

    npm install
    echo ""
    echo "====================================================="
    read -p "Levantamos el Registry + 3 nodos + la Interfaz Grafica... ENTER"
    echo "====================================================="
    sudo -u $nonRootUser gnome-terminal -- npm run startRegistry
    sudo -u $nonRootUser gnome-terminal -- npm start --port 9001
    sudo -u $nonRootUser gnome-terminal -- npm start --port 9002
    sudo -u $nonRootUser gnome-terminal -- npm start --port 9003
    sudo -u $nonRootUser google-chrome ./frontend/index.html
    echo ""
    echo "====================================================="
    read -p "Crea 2 listas vacias, distintas e impactando en nodos distintos... ENTER"
    echo "====================================================="
    content="Content-Type:application/json";
    hash="x-list-hash:avoid";
    curl -H $content -H $hash -X POST -d '{"list":{"title":"Primera lista","creator":"script"}}' http://localhost:9001/lists
    curl -H $content -H $hash -X POST -d '{"list":{"title":"Listerna","creator":"script"}}' http://localhost:9002/lists

    echo ""
    echo "====================================================="
    read -p "Insertamos items en la misma lista desde 2 nodos distintos. Solo un cambio va a ganar quorum, el perdedor se tiene que adaptar... ENTER"
    echo "====================================================="
    curl -H $content -H $hash -X POST -d '{"item":{"text":"dohomework","done":false}}' http://localhost:9001/lists/1/items &
    curl -H $content -H $hash -X POST -d '{"item":{"text":"doNOTdohomework","done":false}}' http://localhost:9002/lists/1/items &
    echo ""
    echo "====================================================="
    read -p "Insertamos items distintos en todos los nodos (3), por ende ninguno va a ganar quorum, ningun cambio se acepta... ENTER"
    echo "====================================================="
    curl -H $content -H $hash -X POST -d '{"item":{"text":"dohomework","done":false}}' http://localhost:9001/lists/1/items &
    curl -H $content -H $hash -X POST -d '{"item":{"text":"doNOTdohomework","done":false}}' http://localhost:9002/lists/1/items &
    curl -H $content -H $hash -X POST -d '{"item":{"text":"doNOTdohomework_ASDA","done":false}}' http://localhost:9003/lists/1/items &
    echo ""
    echo "====================================================="
    read -p "Levantamos nodo 9004 y deberia sincronizarse con todo lo de los demas... ENTER"
    echo "====================================================="
    gnome-terminal -- npm start --port 9004

    echo ""
    echo "====================================================="
    read -p "Al modificar la lista en este nodo nuevo, se replica tambien en todos los demas... ENTER"
    echo "====================================================="

    curl -H $content -H $hash -X POST -d '{"item":{"text":"EstoSeAgregoEnElNodo9004","done":false}}' http://localhost:9001/lists/1/items
    echo ""
    echo "====================================================="
    read -p "Vamos a matar la conexi??n del nodo 9001 (sigue corriendo el proceso pero aislado)... ENTER"
    echo "====================================================="
    # iptables -I INPUT -p tcp --dport 9001 -j REJECT
     curl -H $content -X POST -d '{"time": 60000}' http://localhost:9001/network/lost


    echo ""
    echo "====================================================="
    read -p "Agregamos informaci??n al cluster... ENTER"
    echo "====================================================="
    
    curl -H $content -H $hash -X PUT -d '{"text":"EstoSeEditoCon9001Caido"}' http://localhost:9002/lists/1/items/0
    curl -H $content -H $hash -X PATCH http://localhost:9002/lists/1/items/0/done?status=true


    echo ""
    echo "====================================================="
    read -p "Que pasa si perdemos conexion con el registry 9000 (no se puede cambiar topologia de red) e insertamos datos... ENTER"
    echo "====================================================="
    #iptables -I INPUT -p tcp --dport 9000 -j REJECT
     curl -H $content -X POST -d '{"time": 60000}' http://localhost:9000/network/lost
    echo ""
    curl -H $content -H $hash -X POST -d '{"item":{"text":"EstoSeAgregoConElRegistry9000Caido","done":true}}' http://localhost:9004/lists/1/items

    echo ""
    echo "====================================================="
    read -p "Con el registry caido, no se pueden agregar Nodos... ENTER"
    echo "====================================================="
    gnome-terminal -- npm start --port 9005



    shutdown
fi