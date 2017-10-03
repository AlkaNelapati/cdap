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
import BucketList from 'components/DataPrep/DataPrepBrowser/S3Browser/BucketsList';
import BucketData from 'components/DataPrep/DataPrepBrowser/S3Browser/BucketData';
import {connect} from 'react-redux';

function BucketContainer({activeBucket, enableRouting}) {
  if (!activeBucket) {
    return <BucketList enableRouting={enableRouting} />;
  }

  return <BucketData enableRouting={enableRouting} />;
}

BucketContainer.propTypes = {
  activeBucket: PropTypes.string,
  enableRouting: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
  return {
    activeBucket: state.s3.activeBucket,
    buckets: state.s3.buckets,
    prefix: state.s3.prefix,
    enableRouting: ownProps.enableRouting
  };
};

const BucketWrapper = connect(
  mapStateToProps
)(BucketContainer);

export default BucketWrapper;
