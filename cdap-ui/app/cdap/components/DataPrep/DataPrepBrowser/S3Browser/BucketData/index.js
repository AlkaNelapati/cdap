/*
 * Copyright © 2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
*/

import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import LoadingSVGCentered from 'components/LoadingSVGCentered';
import {Link} from 'react-router-dom';
import {fetchBucketDetails} from 'components/DataPrep/DataPrepBrowser/DataPrepBrowserStore/ActionCreator';
import {preventPropagation} from 'services/helpers';
import classnames from 'classnames';

const onClickHandler = (enableRouting, onWorkspaceCreate, file, e) => {
  if (!file.directory) {
    if (file.wrangle) {
      onWorkspaceCreate(file);
    }
    preventPropagation(e);
    return false;
  }
  if (enableRouting) {
    return;
  }
  if (file.directory) {
    fetchBucketDetails(file.path);
  }
  preventPropagation(e);
  return false;
};


const BucketData = ({data, loading, enableRouting, onWorkspaceCreate}) => {
  if (loading) {
    return <LoadingSVGCentered />;
  }

  if (!Object.keys(data).length) {
    return null;
  }
  let pathname = window.location.pathname.replace(/\/cdap/, '');
  let ContainerElement = enableRouting ? Link : 'div';

  return (
    <div>
      <div className="s3-content-header">
        <div className="row">
          <div className="col-xs-3">
            Name
          </div>
          <div className="col-xs-3">
            Storage Class
          </div>
          <div className="col-xs-3">
            Size
          </div>
          <div className="col-xs-3">
            Last Modified
          </div>
        </div>
      </div>
      <div className="s3-content-body">
        <div className="s3-buckets">
          {
            data.map(file => (
              <ContainerElement
                className={classnames({'disabled': !file.directory && !file.wrangle})}
                to={`${pathname}?prefix=${file.path}`}
                onClick={onClickHandler.bind(null, enableRouting, onWorkspaceCreate, file)}
              >
                <div className="row">
                  <div className="col-xs-3">
                    {file.name}
                  </div>
                  <div className="col-xs-3">
                    {file['class']}
                  </div>
                  <div className="col-xs-3">
                    {file['size']}
                  </div>
                  <div className="col-xs-3">
                    {file['last-modified']}
                  </div>
                </div>
              </ContainerElement>
            ))
          }
        </div>
      </div>
    </div>
  );
};

BucketData.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  enableRouting: PropTypes.bool,
  onWorkspaceCreate: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
  let {enableRouting = true, onWorkspaceCreate = () => {}} = ownProps;
  return {
    data: state.s3.activeBucketDetails,
    loading: state.s3.loading,
    enableRouting,
    onWorkspaceCreate
  };
};

const BucketDataWrapper = connect(
  mapStateToProps
)(BucketData);

export default BucketDataWrapper;
