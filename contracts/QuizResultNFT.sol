// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title QuizResultNFT
 * @dev NFT contract for minting quiz completion certificates on Base
 * Each NFT represents a completed quiz with score, time, and metadata
 */
contract QuizResultNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Quiz result data structure
    struct QuizResult {
        string quizTitle;        // Title of the completed quiz
        string quizId;           // Unique quiz identifier
        uint256 score;           // Score percentage (0-100)
        uint256 timeSpent;       // Time spent in seconds
        uint256 totalQuestions;  // Total questions in quiz
        uint256 correctAnswers;  // Number of correct answers
        uint256 completedAt;     // Timestamp when completed
        address player;          // Address of the quiz taker
        string difficulty;       // easy, medium, hard
        string category;         // Quiz category
    }

    // Mapping from token ID to quiz result
    mapping(uint256 => QuizResult) public quizResults;
    
    // Counter for token IDs
    uint256 private _nextTokenId = 1;
    
    // Events
    event QuizResultMinted(
        uint256 indexed tokenId, 
        address indexed player, 
        string indexed quizId, 
        uint256 score
    );

    constructor() 
        ERC721("Gelora Quiz Certificate", "GQC") 
        Ownable(msg.sender) 
    {}

    /**
     * @dev Mint a new NFT certificate for a completed quiz
     * @param to Address to mint the NFT to
     * @param quizTitle Title of the quiz
     * @param quizId Unique identifier for the quiz
     * @param score Score percentage (0-100)
     * @param timeSpent Time spent completing the quiz in seconds
     * @param totalQuestions Total number of questions
     * @param correctAnswers Number of correct answers
     * @param difficulty Difficulty level (easy, medium, hard)
     * @param category Quiz category
     */
    function mintQuizResult(
        address to,
        string memory quizTitle,
        string memory quizId,
        uint256 score,
        uint256 timeSpent,
        uint256 totalQuestions,
        uint256 correctAnswers,
        string memory difficulty,
        string memory category
    ) external returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(score <= 100, "Score cannot exceed 100%");
        require(totalQuestions > 0, "Must have at least one question");
        require(correctAnswers <= totalQuestions, "Correct answers cannot exceed total");

        uint256 tokenId = _nextTokenId++;
        
        // Store quiz result data
        quizResults[tokenId] = QuizResult({
            quizTitle: quizTitle,
            quizId: quizId,
            score: score,
            timeSpent: timeSpent,
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            completedAt: block.timestamp,
            player: to,
            difficulty: difficulty,
            category: category
        });

        // Mint the NFT
        _safeMint(to, tokenId);
        
        // Set token URI with on-chain metadata
        _setTokenURI(tokenId, _generateTokenURI(tokenId));

        emit QuizResultMinted(tokenId, to, quizId, score);
        
        return tokenId;
    }

    /**
     * @dev Generate on-chain metadata for the NFT
     * @param tokenId The token ID to generate metadata for
     */
    function _generateTokenURI(uint256 tokenId) private view returns (string memory) {
        QuizResult memory result = quizResults[tokenId];
        
        // Generate SVG image based on quiz results
        string memory image = _generateSVG(tokenId);
        
        // Create JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Quiz Certificate #', tokenId.toString(), 
                        '", "description": "Certificate for completing ', result.quizTitle,
                        ' with a score of ', result.score.toString(), '%",',
                        '"image": "data:image/svg+xml;base64,', image, '",',
                        '"attributes": [',
                        '{"trait_type": "Quiz Title", "value": "', result.quizTitle, '"},',
                        '{"trait_type": "Score", "value": ', result.score.toString(), ', "max_value": 100},',
                        '{"trait_type": "Time Spent", "value": ', result.timeSpent.toString(), '},',
                        '{"trait_type": "Difficulty", "value": "', result.difficulty, '"},',
                        '{"trait_type": "Category", "value": "', result.category, '"},',
                        '{"trait_type": "Correct Answers", "value": ', result.correctAnswers.toString(), '},',
                        '{"trait_type": "Total Questions", "value": ', result.totalQuestions.toString(), '},',
                        '{"trait_type": "Completion Date", "value": ', result.completedAt.toString(), '}',
                        ']}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @dev Generate SVG certificate image
     * @param tokenId The token ID to generate image for
     */
    function _generateSVG(uint256 tokenId) private view returns (string memory) {
        QuizResult memory result = quizResults[tokenId];
        
        // Determine colors based on score
        string memory scoreColor = result.score >= 90 ? "#00d0c7" : // Excellent - Gelora accent
                                   result.score >= 70 ? "#3b82f6" : // Good - Blue  
                                   "#ef4444"; // Needs improvement - Red
        
        // Generate certificate SVG
        string memory svg = string(
            abi.encodePacked(
                '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">',
                '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#0b0d10;stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#12151a;stop-opacity:1" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="400" height="300" fill="url(#bg)" stroke="', scoreColor, '" stroke-width="3" rx="12"/>',
                '<text x="200" y="40" text-anchor="middle" fill="#e6ecf3" font-family="Arial, sans-serif" font-size="24" font-weight="bold">GELORA QUIZ</text>',
                '<text x="200" y="65" text-anchor="middle" fill="', scoreColor, '" font-family="Arial, sans-serif" font-size="16">CERTIFICATE</text>',
                '<text x="200" y="105" text-anchor="middle" fill="#e6ecf3" font-family="Arial, sans-serif" font-size="18" font-weight="bold">', _truncateString(result.quizTitle, 25), '</text>',
                '<text x="200" y="140" text-anchor="middle" fill="', scoreColor, '" font-family="Arial, sans-serif" font-size="36" font-weight="bold">', result.score.toString(), '%</text>',
                '<text x="200" y="170" text-anchor="middle" fill="#8b94a7" font-family="Arial, sans-serif" font-size="14">', result.correctAnswers.toString(), '/', result.totalQuestions.toString(), ' correct • ', _formatTime(result.timeSpent), '</text>',
                '<text x="200" y="195" text-anchor="middle" fill="#8b94a7" font-family="Arial, sans-serif" font-size="14">', result.difficulty, ' • ', result.category, '</text>',
                '<text x="200" y="230" text-anchor="middle" fill="#8b94a7" font-family="Arial, sans-serif" font-size="12">Completed on Base Network</text>',
                '<text x="200" y="250" text-anchor="middle" fill="#8b94a7" font-family="Arial, sans-serif" font-size="10">#', tokenId.toString(), '</text>',
                '</svg>'
            )
        );

        return Base64.encode(bytes(svg));
    }

    /**
     * @dev Truncate string to specified length
     */
    function _truncateString(string memory str, uint256 maxLength) private pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length <= maxLength) {
            return str;
        }
        
        bytes memory truncated = new bytes(maxLength - 3);
        for (uint256 i = 0; i < maxLength - 3; i++) {
            truncated[i] = strBytes[i];
        }
        
        return string(abi.encodePacked(truncated, "..."));
    }

    /**
     * @dev Format time from seconds to readable format
     */
    function _formatTime(uint256 seconds) private pure returns (string memory) {
        if (seconds < 60) {
            return string(abi.encodePacked(seconds.toString(), "s"));
        } else if (seconds < 3600) {
            uint256 minutes = seconds / 60;
            uint256 remainingSeconds = seconds % 60;
            return string(abi.encodePacked(minutes.toString(), "m ", remainingSeconds.toString(), "s"));
        } else {
            uint256 hours = seconds / 3600;
            uint256 minutes = (seconds % 3600) / 60;
            return string(abi.encodePacked(hours.toString(), "h ", minutes.toString(), "m"));
        }
    }

    /**
     * @dev Get quiz result data for a token
     * @param tokenId The token ID to get data for
     */
    function getQuizResult(uint256 tokenId) external view returns (QuizResult memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return quizResults[tokenId];
    }

    /**
     * @dev Get all token IDs owned by an address
     * @param owner The address to get tokens for
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
