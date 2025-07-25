// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    struct Shipment {
        string shipmentId;
        string dataHash;
        address owner;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Shipment) public shipments;
    mapping(string => address[]) public shipmentHistory;

    event ShipmentRecorded(string indexed shipmentId, string dataHash, address indexed owner, uint256 timestamp);
    event OwnershipTransferred(string indexed shipmentId, address indexed previousOwner, address indexed newOwner);

    function recordShipment(
        string memory shipmentId,
        string memory dataHash,
        uint256 timestamp
    ) public {
        require(!shipments[shipmentId].exists, "Shipment already exists");

        shipments[shipmentId] = Shipment({
            shipmentId: shipmentId,
            dataHash: dataHash,
            owner: msg.sender,
            timestamp: timestamp,
            exists: true
        });

        shipmentHistory[shipmentId].push(msg.sender);
        emit ShipmentRecorded(shipmentId, dataHash, msg.sender, timestamp);
    }

    function transferOwnership(string memory shipmentId, address newOwner) public {
        require(shipments[shipmentId].exists, "Shipment does not exist");
        require(shipments[shipmentId].owner == msg.sender, "Only current owner can transfer");

        address previousOwner = shipments[shipmentId].owner;
        shipments[shipmentId].owner = newOwner;
        shipmentHistory[shipmentId].push(newOwner);

        emit OwnershipTransferred(shipmentId, previousOwner, newOwner);
    }

    function getShipmentHistory(string memory shipmentId) public view returns (
        string memory dataHash,
        address currentOwner,
        uint256 timestamp
    ) {
        require(shipments[shipmentId].exists, "Shipment does not exist");

        Shipment memory shipment = shipments[shipmentId];
        return (shipment.dataHash, shipment.owner, shipment.timestamp);
    }

    function getShipmentOwners(string memory shipmentId) public view returns (address[] memory) {
        require(shipments[shipmentId].exists, "Shipment does not exist");
        return shipmentHistory[shipmentId];
    }
}
