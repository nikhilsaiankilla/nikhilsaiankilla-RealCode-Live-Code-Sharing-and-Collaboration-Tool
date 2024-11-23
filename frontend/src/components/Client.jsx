import Avatar from 'react-avatar'

const Client = ({ client }) => {
    return (
        <div key={client?.socketId}>
            <Avatar name={client?.userName} size={40} round="14px" />
            <span>
                {client?.userName}
            </span>
        </div>
    )
}

export default Client