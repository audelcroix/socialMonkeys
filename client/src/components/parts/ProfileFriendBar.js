import React, { useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const ProfileFriendBar = (props) => {
  const { friends, status, activeUsername } = { ...props };

  const [showFriends, setShowFriends] = useState(false);

  return (
    <div>
      {friends.length > 0 ? (
        <button
          type='button'
          className='btn btn-highlight'
          onClick={() => {
            setShowFriends(!showFriends);
          }}
        >
          {`${status === "owner" ? "Your" : `${activeUsername}\'s`} friends`}
        </button>
      ) : (
        <p className='h4'>{`${
          status === "owner" ? "Your" : `${activeUsername}\'s`
        } friends list is empty`}</p>
      )}

      {showFriends && (
        <div className='my-3 overflow-auto friends-box mw-75 p-3 border'>
          {friends.map((friend) => (
            <div className={"bg-main text-white p-3 my-2"} key={uuidv4()}>
              <div>
                <Link
                  to={`/user/${friend.slugUsername}`}
                  className='link text-decoration-none'
                >
                  <img
                    className={"friend-list-avatar"}
                    alt={`${friend.username}\'s avatar`}
                    src={`/img/users/avatars/${friend.avatar}`}
                  />
                  {friend.username}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileFriendBar;
