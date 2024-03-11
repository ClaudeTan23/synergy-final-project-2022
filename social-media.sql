-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 11, 2024 at 09:57 AM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `social-media`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `a_username` varchar(255) NOT NULL,
  `a_password` varchar(255) NOT NULL,
  `a_forget_password` varchar(255) NOT NULL,
  `a_email` varchar(255) NOT NULL,
  `a_confirmationCode` varchar(255) NOT NULL,
  `a_status` varchar(255) NOT NULL,
  `a_date_join` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `a_username`, `a_password`, `a_forget_password`, `a_email`, `a_confirmationCode`, `a_status`, `a_date_join`) VALUES
(1, 'qweqwe', '$2b$10$xQVB8JwOcYJW0NIix.KUy.I89iVuw1sH6eubSmRAlEPDN1DHrfQZK', 'none', 'qweqwe@qwe.com', 'None', 'Active', '14-2-2023/10:10'),
(2, 'qweqweqwe', '$2b$10$r8hwfbvIqQoDOECsbrdM/ezvkYRgHTekek9k1TD/XjpoY06nkPn2W', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/9:45'),
(3, 'qwqwqw', '$2b$10$3JoeDSsqYYsAf0omyYADieNyJpLBT5WXQE85yxtggfIahMW99GSYG', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/9:47'),
(4, 'wwwwwww', '$2b$10$.VN0.pn90ryf3xdK9TLQ0uT/xwygyBjiH3ZGjOg.CuL6S2HY98M1G', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/9:49'),
(5, 'aaaaaa', '$2b$10$Z855bDu.H9kqkpz7VJ59bOwIW1nrJQcqUG1zytgJWKPk.RYvP3WeG', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/9:50'),
(6, 'ssssss', '$2b$10$4uEgPMnZ4fBMS44oEMnc5OrDOxpoooHDRFFKzy/5jCjD6AXXaBoZa', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/9:51'),
(7, 'asasas', '$2b$10$mbcovfBcQWZrYsRKwqFMe.KUnKi6yCK1ceYWxZntn4VvXgaWgf5mq', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/9:54'),
(8, 'zxczxczxc', '$2b$10$fgDl7yL6tCnJfxE7SYX.Nu4DpNRLirYdqqeoxuEp7ItpJkhqce8AS', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/9:56'),
(9, 'zxczxc', '$2b$10$GYIrABHjMcvfn5ePg1kVwuW0v0E0dI76LfOPdLZBF.O6kYShwW5Ii', 'none', 'qwe@qwe.com', 'y08etn69bans0482', 'PENDING', '15-2-2023'),
(10, 'qqqqqq', '$2b$10$T4qLBvgCBzANILK6l14CN.dtAQUIgXwPMezwLwgqHUtk/kAkMxMoG', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/11:41'),
(11, 'wwwwww', '$2b$10$/Hne.ATk6GR8UJxDJwR4BOO3CMmZ4zzFIMUKaXeDu95mqp5clhqqW', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/11:44'),
(12, 'aaaaaaa', '$2b$10$RbucqMKvtldvqq7jkM0Phem/u5Vzr7zjNaFCl7SvIewei1FS2CVNG', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/11:49'),
(13, 'wwwwwwwwww', '$2b$10$rqjojsuaoPWS7YiG2vPTb.nJ6XpBiDzxQQJd9F0VqgnlbwmCA3.OS', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/11:51'),
(14, 'zzzzzzz', '$2b$10$xJGksrA2puSTQ7OfPlZ.M.gFrnx6rVPxPJKY0G9fgrbxedlQmMbTS', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/11:52'),
(15, 'wqwqwq', '$2b$10$0tSAllYLIItMSbwlxfF2aetfncemgdd7XxZe765oJKThh8Md1lxwm', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/11:54'),
(16, 'qweqweqweqwe', '$2b$10$3FRUw6LhNU6BaGNfxnwpaOFzpnHJPQaQGNggqKVx6Yx1HXPx8mYwu', 'none', 'qwe@qwe.com', '18yec2vxh84q6r35', 'PENDING', '15-2-2023'),
(17, 'fgfgfg', '$2b$10$GJASV1lB8J92qndeM0Cw/OYNHCpRCpNNr/y7ze3kFHRkd4edmLsdG', 'none', 'qweqweqwe@wqe.com', 'None', 'Active', '15-2-2023/12:54'),
(18, 'qweqweqwew', '$2b$10$B4SqLXFVTkSNLxfurQrZ0uWYr4W7jWTtt20O7Xhoxcv4aZWsbQuoy', 'none', 'qwe@qwe.com', 'None', 'Active', '15-2-2023/12:58');

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE `comment` (
  `cid` int(11) NOT NULL,
  `post_id` varchar(255) NOT NULL,
  `postUserId` varchar(255) NOT NULL,
  `commentUserId` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `media` varchar(255) NOT NULL,
  `time` varchar(255) NOT NULL,
  `comment_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `comment`
--

INSERT INTO `comment` (`cid`, `post_id`, `postUserId`, `commentUserId`, `content`, `media`, `time`, `comment_status`) VALUES
(1, '1', '1', '1', '', '1676984135003-996578465.mp4', '21-2-2023/20:55', 'Active'),
(2, '5', '4', '4', '', '1676984541567-719962289.mp4', '21-2-2023/21:2', 'Active'),
(3, '5', '4', '4', 'qwe', 'none', '21-2-2023/21:7', 'Active'),
(4, '5', '4', '4', '', '1676984892924-897235675.mp4', '21-2-2023/21:8', 'deleted'),
(5, '5', '4', '4', 'qwe', 'none', '21-2-2023/21:9', 'Active'),
(6, '5', '4', '4', '', '1676984986452-34556190.mp4', '21-2-2023/21:9', 'Active'),
(7, '5', '4', '4', 'qwe', 'none', '21-2-2023/21:10', 'deleted'),
(8, '5', '4', '4', '', '1676985099627-269131306.mp4', '21-2-2023/21:11', 'deleted'),
(9, '5', '4', '1', 'qwe', 'none', '21-2-2023/21:12', 'Active'),
(10, '5', '4', '4', 'asd', 'none', '21-2-2023/21:47', 'deleted'),
(11, '8', '2', '2', '', '1677027474791-245024889.png', '22-2-2023/8:57', 'Active'),
(12, '16', '4', '4', 'sdf', 'none', '22-2-2023/11:32', 'Active'),
(13, '16', '4', '4', '', '1677036735293-906282793.mp4', '22-2-2023/11:32', 'Active'),
(14, '18', '2', '2', 'hello', 'none', '22-2-2023/14:3', 'deleted');

-- --------------------------------------------------------

--
-- Table structure for table `delete_comment`
--

CREATE TABLE `delete_comment` (
  `dc_id` int(11) NOT NULL,
  `dc_user_id` varchar(255) NOT NULL,
  `dc_commentId` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `delete_comment`
--

INSERT INTO `delete_comment` (`dc_id`, `dc_user_id`, `dc_commentId`) VALUES
(1, '4', '9'),
(2, '4', '11'),
(3, '2', '9'),
(4, '2', '7');

-- --------------------------------------------------------

--
-- Table structure for table `delete_message`
--

CREATE TABLE `delete_message` (
  `d_id` int(11) NOT NULL,
  `d_user_id` varchar(255) NOT NULL,
  `d_message_id` varchar(255) NOT NULL,
  `d_room_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `delete_message`
--

INSERT INTO `delete_message` (`d_id`, `d_user_id`, `d_message_id`, `d_room_id`) VALUES
(1, '4', '4', '2'),
(2, '4', '2', '1'),
(3, '4', '8', '1'),
(4, '2', '19', '4'),
(5, '4', '20', '2'),
(6, '4', '23', '2'),
(7, '4', '24', '2'),
(8, '4', '25', '2'),
(9, '16', '29', '5');

-- --------------------------------------------------------

--
-- Table structure for table `delete_post`
--

CREATE TABLE `delete_post` (
  `dp_id` int(11) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `dp_postId` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `delete_post`
--

INSERT INTO `delete_post` (`dp_id`, `userId`, `dp_postId`) VALUES
(1, '4', '9'),
(2, '2', '5');

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `f_id` int(11) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `friend_id` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `f_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `friends`
--

INSERT INTO `friends` (`f_id`, `userId`, `friend_id`, `action`, `f_status`) VALUES
(1, '4', '1', 'blocking', 'blocked'),
(2, '1', '4', 'blocked', 'blocked'),
(3, '4', '2', 'requesting', 'friended'),
(4, '2', '4', 'accepted', 'friended'),
(5, '4', '5', 'requesting', 'friended'),
(6, '5', '4', 'accepted', 'friended'),
(7, '2', '16', 'requesting', 'friended'),
(8, '16', '2', 'accepted', 'friended');

-- --------------------------------------------------------

--
-- Table structure for table `hide_message`
--

CREATE TABLE `hide_message` (
  `h_id` int(11) NOT NULL,
  `h_userId` varchar(255) NOT NULL,
  `h_messageId` varchar(255) NOT NULL,
  `h_roomId` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `hide_message`
--

INSERT INTO `hide_message` (`h_id`, `h_userId`, `h_messageId`, `h_roomId`) VALUES
(1, '1', '2', '1'),
(2, '16', '32', '6');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `like_id` int(11) NOT NULL,
  `post_id` varchar(255) NOT NULL,
  `like_user_id` varchar(255) NOT NULL,
  `liked` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`like_id`, `post_id`, `like_user_id`, `liked`) VALUES
(1, '16', '4', 'liked'),
(2, '17', '4', 'liked'),
(3, '13', '4', 'liked'),
(4, '18', '2', 'liked'),
(5, '8', '2', 'liked');

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `message_id` int(11) NOT NULL,
  `m_room_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `message_content` varchar(255) NOT NULL,
  `message_type` varchar(255) NOT NULL,
  `message_time` varchar(255) NOT NULL,
  `message_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`message_id`, `m_room_id`, `user_id`, `message_content`, `message_type`, `message_time`, `message_status`) VALUES
(1, '1', '4', 'none', 'conversation created', '21-2-2023/20:57', 'Active'),
(2, '1', '4', '1676984259161-977682900.mp4', 'media', '21-2-2023/20:57', 'Active'),
(3, '2', '4', 'none', 'group created', '21-2-2023/20:58', 'Active'),
(4, '2', '4', '1676984311905-133246012.mp4', 'media', '21-2-2023/20:58', 'Active'),
(5, '1', '4', 'lp', 'message', '21-2-2023/21:15', 'Active'),
(6, '1', '4', 'qwe', 'message', '21-2-2023/21:16', 'Active'),
(7, '1', '4', 'ww', 'message', '21-2-2023/21:16', 'Active'),
(8, '1', '4', 'asd', 'message', '21-2-2023/21:16', 'Active'),
(9, '2', '4', '1677024631261-245648332.png', 'media', '22-2-2023/8:10', 'Active'),
(10, '3', '4', 'none', 'group created', '22-2-2023/8:42', 'Active'),
(11, '4', '4', 'none', 'group created', '22-2-2023/8:43', 'Active'),
(12, '4', '2', 'none', 'removed', '22-2-2023/8:57', 'Active'),
(13, '4', '2', 'none', 'member join', '22-2-2023/8:57', 'Active'),
(14, '3', '4', 'none', 'disband', '22-2-2023/8:59', 'Active'),
(15, '4', '2', 'none', 'removed', '22-2-2023/8:59', 'Active'),
(16, '4', '2', 'none', 'member join', '22-2-2023/9:0', 'Active'),
(17, '4', '2', 'none', 'exit group', '22-2-2023/9:0', 'Active'),
(18, '4', '2', 'none', 'member join', '22-2-2023/9:0', 'Active'),
(19, '4', '2', 'asd', 'message', '22-2-2023/10:9', 'Active'),
(20, '2', '4', '1677036761825-339470248.mp4', 'media', '22-2-2023/11:32', 'Active'),
(21, '2', '4', 'got code problem', 'message', '22-2-2023/11:33', 'Active'),
(22, '2', '5', 'none', 'member join', '22-2-2023/11:34', 'Active'),
(23, '2', '4', '1677036860621-269063117.png', 'media', '22-2-2023/11:34', 'Active'),
(24, '2', '4', 'asd', 'message', '22-2-2023/12:12', 'Active'),
(25, '2', '4', '1677044775328-68433301.mp4', 'media', '22-2-2023/13:46', 'Active'),
(26, '5', '16', 'none', 'conversation created', '22-2-2023/14:7', 'Active'),
(27, '5', '16', 'Hello', 'message', '22-2-2023/14:8', 'Active'),
(28, '5', '16', '1677046103571-691234237.png', 'media', '22-2-2023/14:8', 'Active'),
(29, '5', '16', '1677046110526-320077559.mp4', 'media', '22-2-2023/14:8', 'Active'),
(30, '6', '2', 'none', 'group created', '22-2-2023/14:10', 'Active'),
(31, '6', '2', 'this is group', 'message', '22-2-2023/14:10', 'Active'),
(32, '6', '2', '1677046256074-55487506.mp4', 'media', '22-2-2023/14:10', 'Active'),
(33, '6', '16', '1677046262853-925573790.png', 'media', '22-2-2023/14:11', 'Active'),
(34, '6', '4', 'none', 'removed', '22-2-2023/14:11', 'Active'),
(35, '6', '16', 'none', 'removed', '22-2-2023/14:11', 'Active'),
(36, '6', '2', 'hi', 'message', '22-2-2023/14:12', 'Active'),
(37, '6', '16', 'none', 'member join', '22-2-2023/14:12', 'Active'),
(38, '6', '2', 'none', 'disband', '22-2-2023/14:12', 'Active'),
(39, '5', '2', 'hi', 'message', '22-2-2023/14:13', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `message_room`
--

CREATE TABLE `message_room` (
  `chat_id` int(11) NOT NULL,
  `room_name` varchar(255) NOT NULL,
  `chat_adminId` varchar(255) NOT NULL,
  `chat_type` varchar(255) NOT NULL,
  `chat_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `message_room`
--

INSERT INTO `message_room` (`chat_id`, `room_name`, `chat_adminId`, `chat_type`, `chat_status`) VALUES
(1, 'none', 'none', 'friend', 'Active'),
(2, 'asd', '4', 'group', 'Active'),
(3, 'Netwoking group', '4', 'group', 'disband'),
(4, 'Networking issue group', '4', 'group', 'Active'),
(5, 'none', 'none', 'friend', 'Active'),
(6, 'programming', '2', 'group', 'disband');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `n_id` int(11) NOT NULL,
  `request_userId` varchar(255) NOT NULL,
  `receive_userId` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `n_time` varchar(255) NOT NULL,
  `n_status` varchar(255) NOT NULL,
  `seen` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE `post` (
  `post_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `media` text NOT NULL,
  `total_likes` int(11) NOT NULL,
  `total_comments` int(11) NOT NULL,
  `date_posted` varchar(255) NOT NULL,
  `react_unseen` int(11) NOT NULL,
  `post_unseen_time` varchar(255) NOT NULL,
  `post_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `post`
--

INSERT INTO `post` (`post_id`, `user_id`, `content`, `media`, `total_likes`, `total_comments`, `date_posted`, `react_unseen`, `post_unseen_time`, `post_status`) VALUES
(1, '1', '', '1676876860016-38665994.png', 0, 1, '20-2-2023/15:7', 0, '', 'Active'),
(2, '1', '', '1676982834730-236937811.mp4', 0, 0, '21-2-2023/20:33', 0, '', 'deleted'),
(3, '4', 'qwe', '1676984393902-447168245.png', 0, 0, '21-2-2023/20:59', 0, '', 'deleted'),
(4, '4', 'qwe', 'none', 0, 0, '21-2-2023/21:0', 0, '', 'deleted'),
(5, '4', 'qwe', 'none', 0, 5, '21-2-2023/21:0', 0, '', 'Active'),
(6, '4', '', '1676987221222-885482785.jpeg', 0, 0, '21-2-2023/21:47', 0, '', 'deleted'),
(7, '2', 'This is a blue cloud', '1677023696594-448505116.png', 0, 0, '22-2-2023/7:54', 0, '', 'Active'),
(8, '2', 'hi programmer :D', 'none', 1, 1, '22-2-2023/7:55', 0, '', 'deleted'),
(9, '5', 'This is a rocket', '1677023747329-484267551.png', 0, 0, '22-2-2023/7:55', 0, '', 'Active'),
(10, '5', 'Hello Programmer hope we have a good day :)', 'none', 0, 0, '22-2-2023/7:56', 0, '', 'Active'),
(11, '4', 'hi', 'none', 0, 0, '22-2-2023/8:0', 0, '', 'deleted'),
(12, '2', 'asd', 'none', 0, 0, '22-2-2023/10:9', 0, '', 'deleted'),
(13, '2', 'asd', 'none', 1, 0, '22-2-2023/10:10', 0, '', 'Active'),
(14, '4', '', '1677034541331-179549511.png', 0, 0, '22-2-2023/10:55', 0, '', 'deleted'),
(15, '4', '', '1677034547279-850980450.mp4', 0, 0, '22-2-2023/10:55', 0, '', 'deleted'),
(16, '4', '', '1677036721573-589338644.png,1677036721574-407970207.mp4', 1, 2, '22-2-2023/11:32', 0, '', 'deleted'),
(17, '4', '', '1677044792933-590046472.mp4', 1, 0, '22-2-2023/13:46', 0, '', 'Active'),
(18, '2', 'this is my code', '1677045768848-822018166.png,1677045768850-26424114.mp4', 1, 0, '22-2-2023/14:2', 0, '', 'deleted');

-- --------------------------------------------------------

--
-- Table structure for table `report_comment`
--

CREATE TABLE `report_comment` (
  `rc_id` int(11) NOT NULL,
  `rc_comment_id` varchar(255) NOT NULL,
  `rc_user_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `report_comment`
--

INSERT INTO `report_comment` (`rc_id`, `rc_comment_id`, `rc_user_id`) VALUES
(1, '72', '12'),
(2, '71', '12'),
(3, '70', '12'),
(4, '68', '12'),
(5, '67', '12'),
(6, '66', '12'),
(7, '29', '12'),
(8, '131', '12');

-- --------------------------------------------------------

--
-- Table structure for table `report_post`
--

CREATE TABLE `report_post` (
  `r_id` int(11) NOT NULL,
  `r_post_id` varchar(255) NOT NULL,
  `r_user_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `report_post`
--

INSERT INTO `report_post` (`r_id`, `r_post_id`, `r_user_id`) VALUES
(1, '43', '12'),
(3, '57', '12'),
(4, '9', '12'),
(5, '8', '12'),
(6, '10', '7'),
(7, '73', '12'),
(8, '40', '12');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `forget_password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `profile` varchar(255) NOT NULL,
  `background` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `confirmationCode` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `darkmode` varchar(255) NOT NULL,
  `date_join` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `user_notification` int(11) NOT NULL,
  `socket_exist` int(11) NOT NULL,
  `online_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `password`, `forget_password`, `name`, `profile`, `background`, `gender`, `email`, `confirmationCode`, `status`, `darkmode`, `date_join`, `position`, `user_notification`, `socket_exist`, `online_status`) VALUES
(1, 'taneefun', '$2b$10$vncjVjv1wgDrJNTZADtzLesCD/M9c1/VVSkP/d9XxR4BTpMvnNIoi', 'none', 'eefun', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', '2k32e12z761jw04i', 'Active', 'off', '20-2-2023/8:43', 'user', 0, 0, 'off'),
(2, 'brennan', '$2b$10$RESXEKBKGTXM60CmhwADHOpi0lEL.Q75TpXAEiP/GMGiMGJ4RrDo6', 'none', 'Brenna', '1677046510447-380329909.gif', '1677046519639-162504630.png', '-', 'qwe@qwe.com', 'hqly9v6si6e42xvg', 'Active', 'off', '20-2-2023/9:28', 'user', 0, 0, 'off'),
(3, 'pingteacher', '$2b$10$r32OQMvCBBSmp7eA1LRr9.i/4KQR6qJEuhzfk88pm2AkiTO0Q0fEC', 'none', 'teacher ping', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', '6n8wbx889ph9yz59', 'Active', 'off', '20-2-2023/9:32', 'user', 0, 0, 'off'),
(4, 'yongsentan', '$2b$10$gabOAkkB.MRmwlGPnwQ7IeoXdFI2wc3T2647qwZ/PX4SR1nAEtSKa', 'none', 'yongsentan', '1676985446121-872111405.png', '1676985450397-357479778.png', '-', 'tanyongsen23@gmail.com', '3xq2rjfdm22ki4oe', 'Active', 'off', '20-2-2023/16:37', 'user', 0, 0, 'off'),
(5, 'wongpatkit', '$2b$10$v9wfrJivAo8Iu91xWpmdpe8B.jpK/CqTwurBjila/R6X74.fAeg5S', 'none', 'wongpatkit', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyogsen23@gmail.com', 'xkkb28802dg008c1', 'Active', 'off', '21-2-2023/20:35', 'user', 0, 0, 'off'),
(6, 'zxczxc', '$2b$10$MvvlJP1wtriUoLMhw0IoauwjADtN5Vlcj2xnLPlBlRbWSC8VQ8pJW', 'none', 'zxczxc', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', '50nmty15m4xuar5t', 'Active', 'off', '21-2-2023/20:37', 'user', 0, 0, 'off'),
(7, 'zxczxczcx', '$2b$10$ARbLTsC5OqtwOZIYQObvE.HB3ZbHbceToTH34vvn/QPZcgEqtRHJu', 'none', 'zxczxczcx', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', '56643g44fzd8ikb6', 'PENDING', 'off', '21-2-2023/20:39', 'user', 0, 0, 'off'),
(8, 'zxczxczxc', '$2b$10$GEWKstRaPpGKpMk8PmrnEeepiM746HxcTBujGrVIjrVgkncIDvQ2S', 'none', 'zxczxczxc', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', 'j79z1u88iy92jw6s', 'PENDING', 'off', '21-2-2023/20:52', 'user', 0, 0, 'off'),
(9, 'xcvxcv', '$2b$10$EEjp7eLXny7SD43fD/niHOEfxTVV/U20BefDs9WjrhSgG82ja5Aj2', 'none', 'xcvxcv', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', 'sd6mf19r336nn4rq', 'Deactivate', 'off', '21-2-2023/21:21', 'user', 0, 0, 'off'),
(10, 'shirxun', '$2b$10$rH.jPyvakYqvBDLekbdf7utev0k/z4tOzkhGxIqNPIss9U/pUHzYS', 'ggmiuyenmxjbopvsdpnaygkzmp', 'shirxun', 'blankpf.jpg', 'blankbg.jpg', '-', 'shirxun20020828@gmail.com', '27983pl6584k1aw6', 'Active', 'off', '22-2-2023/7:44', 'user', 0, 0, 'off'),
(11, 'tanyongsen', '$2b$10$SgOnaDcj3/v.BoGFWK9ZtOURQZyvvdF1yIsqYACcHspiKp.FtNxb.', 'none', 'john123', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', '0s1xea68l9m70919', 'Active', 'off', '22-2-2023/7:47', 'user', 0, 0, 'off'),
(12, 'cvbcvbcvb', '$2b$10$VHCxF0Zb7Aj6qbVbScoLguitemgVULGxGYcMN2XLNSxIquCnmHRAO', 'none', 'cvbcvbcvb', 'blankpf.jpg', 'blankbg.jpg', '-', 'qwe@qwe.com', '830ns9ercsr2jq1m', 'PENDING', 'off', '22-2-2023/11:9', 'user', 0, 0, 'off'),
(13, 'cvbcvb', '$2b$10$9/Q2sgP1NlUfhqRQ3q9aO.WesChqwMFsYUjLSWkhZZCK/1HWIhhCS', 'none', 'cvbcvb', 'blankpf.jpg', 'blankbg.jpg', '-', 'cvbcvb@cvb.com', '1pr7067k82665rs2', 'PENDING', 'off', '22-2-2023/11:30', 'user', 0, 0, 'off'),
(14, 'vbnvbn', '$2b$10$3fJzeN7wwpvNu23QkOngWuiO75RkZTmRVVHGIW5MeOd8XOhihKhla', 'none', 'vbnvbn', 'blankpf.jpg', 'blankbg.jpg', '-', 'vbn@vbn.com', '17b88k202o941v24', 'PENDING', 'off', '22-2-2023/12:13', 'user', 0, 0, 'off'),
(15, 'ghjghj', '$2b$10$VzMs30dUXyaoqYEnmyYHWOcLrZnG9H0aGMxR5YH9xQcGPUIc8ZIkO', 'none', 'ghjghj', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', '8xup7khmt8ado0sc', 'Active', 'off', '22-2-2023/13:44', 'user', 0, 0, 'off'),
(16, 'tanyongsen23', '$2b$10$fxXiNyVHmzMjbTtO2ThWkueLnJa350Fp2EePM0cvoeM94py4isyFm', 'none', 'tanyongsen23', 'blankpf.jpg', 'blankbg.jpg', '-', 'tanyongsen23@gmail.com', '4e4978f0bki3bfk6', 'Active', 'off', '22-2-2023/14:0', 'user', 0, 0, 'off');

-- --------------------------------------------------------

--
-- Table structure for table `user_message_room`
--

CREATE TABLE `user_message_room` (
  `um_id` int(11) NOT NULL,
  `um_friend_id` varchar(255) NOT NULL,
  `um_userId` varchar(255) NOT NULL,
  `um_roomId` varchar(255) NOT NULL,
  `um_status` varchar(255) NOT NULL,
  `delete_time` varchar(255) NOT NULL,
  `delete_status` varchar(255) NOT NULL,
  `um_remove_time` varchar(255) NOT NULL,
  `unseen_msg` int(11) NOT NULL,
  `on_chat` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user_message_room`
--

INSERT INTO `user_message_room` (`um_id`, `um_friend_id`, `um_userId`, `um_roomId`, `um_status`, `delete_time`, `delete_status`, `um_remove_time`, `unseen_msg`, `on_chat`) VALUES
(1, '1', '4', '1', 'Active', 'none', 'none', 'none', 0, 0),
(2, '4', '1', '1', 'Active', 'none', 'none', 'none', 0, 0),
(3, 'none', '4', '2', 'Active', 'none', 'none', 'none', 0, 0),
(4, 'none', '1', '2', 'Active', 'none', 'none', 'none', 9, 0),
(5, 'none', '4', '3', 'disband', 'none', 'none', '14', 0, 0),
(6, 'none', '2', '3', 'disband', 'none', 'none', '14', 0, 0),
(7, 'none', '4', '4', 'Active', 'none', 'none', 'none', 0, 0),
(8, 'none', '5', '4', 'Active', 'none', 'none', 'none', 8, 0),
(9, 'none', '2', '4', 'Active', 'none', 'none', '17', 0, 0),
(10, 'none', '5', '2', 'Active', 'none', 'none', 'none', 4, 0),
(11, '2', '16', '5', 'Active', 'none', 'none', 'none', 0, 0),
(12, '16', '2', '5', 'Active', 'none', 'none', 'none', 0, 0),
(13, 'none', '2', '6', 'disband', 'none', 'none', '38', 0, 0),
(14, 'none', '16', '6', 'disband', 'none', 'none', '38', 0, 0),
(15, 'none', '4', '6', 'removed', 'none', 'none', '34', 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`cid`);

--
-- Indexes for table `delete_comment`
--
ALTER TABLE `delete_comment`
  ADD PRIMARY KEY (`dc_id`);

--
-- Indexes for table `delete_message`
--
ALTER TABLE `delete_message`
  ADD PRIMARY KEY (`d_id`);

--
-- Indexes for table `delete_post`
--
ALTER TABLE `delete_post`
  ADD PRIMARY KEY (`dp_id`);

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`f_id`);

--
-- Indexes for table `hide_message`
--
ALTER TABLE `hide_message`
  ADD PRIMARY KEY (`h_id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`like_id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`message_id`);

--
-- Indexes for table `message_room`
--
ALTER TABLE `message_room`
  ADD PRIMARY KEY (`chat_id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`n_id`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`post_id`);

--
-- Indexes for table `report_comment`
--
ALTER TABLE `report_comment`
  ADD PRIMARY KEY (`rc_id`);

--
-- Indexes for table `report_post`
--
ALTER TABLE `report_post`
  ADD PRIMARY KEY (`r_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_message_room`
--
ALTER TABLE `user_message_room`
  ADD PRIMARY KEY (`um_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `comment`
--
ALTER TABLE `comment`
  MODIFY `cid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `delete_comment`
--
ALTER TABLE `delete_comment`
  MODIFY `dc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `delete_message`
--
ALTER TABLE `delete_message`
  MODIFY `d_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `delete_post`
--
ALTER TABLE `delete_post`
  MODIFY `dp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
  MODIFY `f_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `hide_message`
--
ALTER TABLE `hide_message`
  MODIFY `h_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `like_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `message_room`
--
ALTER TABLE `message_room`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `n_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `post`
--
ALTER TABLE `post`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `report_comment`
--
ALTER TABLE `report_comment`
  MODIFY `rc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `report_post`
--
ALTER TABLE `report_post`
  MODIFY `r_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_message_room`
--
ALTER TABLE `user_message_room`
  MODIFY `um_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
