'use client';

import React, { type Dispatch, type SetStateAction, useState } from 'react';
import { ChannelList, useChatContext } from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';
import Cookies from 'universal-cookie';

import { ChannelSearch, TeamChannelList, TeamChannelPreview } from './';
import HospitalIcon from '../../../assets/chat/hospital.png';
import LogoutIcon from '../../../assets/chat/logout.png';

const cookies = new Cookies();

// ChannelListをanyとして型キャストし、独自のList/Previewプロパティの型チェックを回避
const TypedChannelList = ChannelList as any;

interface SideBarProps {
    logout: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ logout }) => (
    <div className="channel-list__sidebar">
        <div className="channel-list__sidebar__icon1">
            <div className="icon1__inner">
                <img src={HospitalIcon} alt="Hospital" width="30" />
            </div>
        </div>
        <div className="channel-list__sidebar__icon2">
            <div className="icon1__inner" onClick={logout}>
                <img src={LogoutIcon} alt="Logout" width="30" />
            </div>
        </div>
    </div>
);

const CompanyHeader: React.FC = () => (
    <div className="channel-list__header">
        <p className="channel-list__header__text">Medical Pager</p>
    </div>
);

const customChannelTeamFilter = (channels: StreamChannel[]) => {
    return channels.filter((channel) => channel.type === 'team');
};

const customChannelMessagingFilter = (channels: StreamChannel[]) => {
    return channels.filter((channel) => channel.type === 'messaging');
};

interface ChannelListContentProps {
    isCreating?: boolean;
    setIsCreating?: Dispatch<SetStateAction<boolean>>;
    setCreateType?: Dispatch<SetStateAction<string>>;
    setIsEditing?: Dispatch<SetStateAction<boolean>>;
    setToggleContainer?: Dispatch<SetStateAction<boolean>>;
}

const ChannelListContent: React.FC<ChannelListContentProps> = ({
    isCreating,
    setIsCreating,
    setCreateType,
    setIsEditing,
    setToggleContainer
}) => {
    const { client } = useChatContext();

    const logout = () => {
        cookies.remove("token");
        cookies.remove('userId');
        cookies.remove('username');
        cookies.remove('fullName');
        cookies.remove('avatarURL');
        cookies.remove('hashedPassword');
        cookies.remove('phoneNumber');

        window.location.reload();
    };

    const filters = { members: { $in: [client.userID || ''] } };

    return (
        <>
            <SideBar logout={logout} />
            <div className="channel-list__list__wrapper">
                <CompanyHeader />
                <ChannelSearch setToggleContainer={setToggleContainer} />
                <TypedChannelList
                    filters={filters}
                    channelRenderFilterFn={customChannelTeamFilter}
                    List={(listProps: any) => (
                        <TeamChannelList
                            {...listProps}
                            type="team"
                            isCreating={isCreating}
                            setIsCreating={setIsCreating}
                            setCreateType={setCreateType}
                            setIsEditing={setIsEditing}
                            setToggleContainer={setToggleContainer}
                        />
                    )}
                    Preview={(previewProps: any) => (
                        <TeamChannelPreview
                            {...previewProps}
                            setIsCreating={setIsCreating}
                            setIsEditing={setIsEditing}
                            setToggleContainer={setToggleContainer}
                            type="team"
                        />
                    )}
                />
                <TypedChannelList
                    filters={filters}
                    channelRenderFilterFn={customChannelMessagingFilter}
                    List={(listProps: any) => (
                        <TeamChannelList
                            {...listProps}
                            type="messaging"
                            isCreating={isCreating}
                            setIsCreating={setIsCreating}
                            setCreateType={setCreateType}
                            setIsEditing={setIsEditing}
                            setToggleContainer={setToggleContainer}
                        />
                    )}
                    Preview={(previewProps: any) => (
                        <TeamChannelPreview
                            {...previewProps}
                            setIsCreating={setIsCreating}
                            setIsEditing={setIsEditing}
                            setToggleContainer={setToggleContainer}
                            type="messaging"
                        />
                    )}
                />
            </div>
        </>
    );
};

interface ChannelListContainerProps {
    setCreateType: Dispatch<SetStateAction<string>>;
    setIsCreating: Dispatch<SetStateAction<boolean>>;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
}

const ChannelListContainer: React.FC<ChannelListContainerProps> = ({ setCreateType, setIsCreating, setIsEditing }) => {
    const [toggleContainer, setToggleContainer] = useState(false);

    return (
        <>
            <div className="channel-list__container">
                <ChannelListContent
                    setIsCreating={setIsCreating}
                    setCreateType={setCreateType}
                    setIsEditing={setIsEditing}
                />
            </div>

            <div className="channel-list__container-responsive"
                style={{ left: toggleContainer ? "0%" : "-89%", backgroundColor: "#005fff" }}
            >
                <div className="channel-list__container-toggle" onClick={() => setToggleContainer((prevToggleContainer) => !prevToggleContainer)}>
                </div>
                <ChannelListContent
                    setIsCreating={setIsCreating}
                    setCreateType={setCreateType}
                    setIsEditing={setIsEditing}
                    setToggleContainer={setToggleContainer}
                />
            </div>
        </>
    );
};

export default ChannelListContainer;