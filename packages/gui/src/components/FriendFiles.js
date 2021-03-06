// @flow
/** @jsx jsx */
/* eslint-disable react/no-this-in-sfc */
import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import cx from 'classnames';
import styled from '@emotion/styled';
import { jsx, css } from '@emotion/core';
import type { Uuid } from '../../../../type';
import type { Friend, EditingFile, Dispatch } from '../redux/type';
import { values } from './utils';
import * as actions from '../redux/actions';

const Loading = styled.h1`
  text-align: center;
  line-height: calc(100vh - 30px);
  opacity: 0.3;
`;

const wrap = css`
  margin: 0;
  padding: 1.5em;

  & .search {
    display: none;
    position: absolute;
    top: 4px;
    right: -28px;
  }

  & .parent:hover .search {
    display: block;
  }

  & > li {
    margin-bottom: 9px;
  }

  & li {
    white-space: nowrap;
    list-style: none;
  }

  & > li > ul {
    padding-left: 20px;
  }

  & li.collapsed > ul {
    display: none;
  }

  & .toggler::before {
    cursor: pointer;
    width: 11px;
    display: inline-block;
    font-style: normal;
    font-variant: normal;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    content: "\f0d7";
    color: var(--accent);
    margin-right: 0;
  }

  & .collapsed .toggler::before {
    content: "\f0da";
  }
`;

const editionLi = css`
  margin-top: 0.5em;
  white-space: nowrap;

  & > span {
    text-transform: capitalize;
  }

  & > ul {
    margin: 0.35em 0 0.75em;
    padding-left: 2em;
  }
`;

const Filename = styled.li`
  margin: 6px;

  &::before {
    content: "• ";
    opacity: 0;
    color: orange;
  }

  &.edited::before {
    opacity: 1;
  }

  & code {
    font-size: 13px;
    cursor: pointer;
    padding: 2px 8px;
    background: #232323;
    &:hover {
      background: #000;
    }
  }

  &.editing {
    & code {
      color: #000;
      cursor: default;
      background: var(--accent);
    }
  }
`;

const IconSearch = styled.i`
  padding-left: 10px;

  &::before {
    width: 11px;
    display: inline-block;
    font-style: normal;
    font-variant: normal;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    content: ${(props) => props.isEdition ? '"\f02e"' : '"\f02d"'};
    margin-right: 0.75em;
    color: #999;
  }

  &:hover::before {
    content: "\f002";
    color: white;
  }
`;


type Props = {|
  taskId: Uuid,
  collapsed: Object,
  friend: Friend,
  editingFile: EditingFile,
  selectFile: Dispatch,
  collapseTask: Dispatch,
  updateSearch: Dispatch,
|};

class FriendFiles extends React.Component<Props> {
  search(path) {
    const { updateSearch } = this.props;
    const [documentSlug, editionType] = path.split('/');
    updateSearch({
      searching: true,
      documentSlug: documentSlug || null,
      editionType: editionType || null,
    });
  }

  renderDoc = (doc) => {
    const { collapsed, collapseTask, taskId } = this.props;
    const key = doc.slug;
    const isCollapsed = collapsed[key] || false;
    return (
      <li
        key={doc.slug}
        className={cx('parent', { collapsed: isCollapsed })}
      >
        <span
          className="toggler"
          onClick={() => collapseTask({ taskId, key, isCollapsed })}
        />
        <IconSearch onClick={() => this.search(key)} />
        {doc.title}
        <ul>
          {values(doc.editions).map(ed => this.renderEdition(ed, doc))}
        </ul>
      </li>
    );
  }

  renderEdition = (ed, doc) => {
    const { collapsed, collapseTask, taskId } = this.props;
    const key = [doc.slug, ed.type].join('/');
    const isCollapsed = collapsed[key] || false;
    return (
      <li
        key={doc.slug}
        className={cx('parent', { collapsed: isCollapsed })}
        css={editionLi}
      >
        <span
          className="toggler"
          onClick={() => collapseTask({ taskId, key, isCollapsed })}
        />
        <IconSearch onClick={() => this.search(key)} isEdition />
        <span className="edition-type">{ed.type}</span> edition:
        <ul>
          {values(ed.files).map(file => this.renderFile(file, ed, doc))}
        </ul>
      </li>
    );
  }

  renderFile = (file, ed, doc) => {
    const { friend, editingFile, selectFile } = this.props;
    const fileData = {
      lang: 'en',
      friend: friend.slug,
      document: doc.slug,
      edition: ed.type,
      filename: file.filename,
    };
    const editing = isEqual(fileData, editingFile);
    return (
      <Filename
        key={file.filename}
        onClick={(e) => {
          e.stopPropagation();
          selectFile(fileData);
        }}
        className={cx({
          editing,
          edited: file.diskContent !== file.editedContent,
        })}
      >
        <code>{file.filename}</code>
      </Filename>
    );
  }

  render() {
    const { friend } = this.props;
    if (!friend.filesReceived) {
      return (<Loading>Loading...</Loading>);
    }

    return (
      <ul css={wrap}>
        {values(friend.documents).map(this.renderDoc)}
      </ul>
    );
  }
}

const mapState = state => {
  const task = state.tasks[state.currentTask];
  return {
    taskId: task.id || '',
    editingFile: state.editingFile,
    collapsed: task.collapsed || {},
  };
};

const mapDispatch = {
  selectFile: actions.setEditingFile,
  collapseTask: actions.collapseTask,
  updateSearch: actions.updateSearch,
};

export default connect(mapState, mapDispatch)(FriendFiles);
