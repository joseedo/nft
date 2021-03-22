pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract Color is ERC721Full {
  string[] public colors;
  string[] public tokenURIs;
  mapping(string => bool) _colorExists;

  constructor() ERC721Full("Color", "COLOR") public {
  }

  // E.G. color = "#FFFFFF"
  function mint(string memory _color, string memory _tokenURI) public {
    require(!_colorExists[_color]);
    uint _id = colors.push(_color);
    tokenURIs[_id] = _tokenURI;
    _mint(msg.sender, _id);
    _setTokenURI(_id, _tokenURI);
    _colorExists[_color] = true;
   
  }

}
