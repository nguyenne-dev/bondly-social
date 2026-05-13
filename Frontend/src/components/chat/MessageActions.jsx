import React, { memo } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { EMOJI_LIST } from '../../utils/constants';

export const MessageActions = memo(({
  isMe,
  onReact,
  onDeleteForMe,
  onRecall,
}) => {
  return (
    <div className="message-actions-toolbar animate-fade-in">
      {/* Emoji quick react */}
      {EMOJI_LIST.slice(0, 4).map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact && onReact(emoji)}
          className="message-action-emoji"
          aria-label={`Thả biểu cảm ${emoji}`}
        >
          {emoji}
        </button>
      ))}

      {/* Delete for me button (Xóa một bên, không xóa DB thật) */}
      {onDeleteForMe && (
        <button
          onClick={onDeleteForMe}
          className="btn-icon"
          style={{ width: '26px', height: '26px', color: 'var(--text-subtle)' }}
          title="Xóa ở phía bạn"
          aria-label="Xóa tin nhắn ở phía bạn"
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* Recall button if mine (Thu hồi với tất cả mọi người) */}
      {isMe && onRecall && (
        <button
          onClick={onRecall}
          className="btn-icon"
          style={{ width: '26px', height: '26px', color: 'var(--danger)' }}
          title="Thu hồi tin nhắn với tất cả"
          aria-label="Thu hồi tin nhắn với tất cả"
        >
          <RotateCcw size={13} />
        </button>
      )}
    </div>
  );
});

export default MessageActions;
